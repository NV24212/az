import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { api } from '../../lib/api';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '../../components/ui/Loading';

const STATUSES = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

type Order = { orderId: number; customer?: { customerId: number; name: string }; status: typeof STATUSES[number]; totalAmount: number; createdAt: string; items?: { productId: number; quantity: number; priceAtPurchase: number; product?: { name: string } }[] };

type Customer = { customerId: number; name: string };

type Product = { productId: number; name: string; price: number; stockQuantity: number };

export default function Orders() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({ queryKey: ['admin-orders'], queryFn: async () => (await api.get('/api/admin/orders/?limit=1000')).data as Order[] });
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({ queryKey: ['admin-customers-lite'], queryFn: async () => (await api.get('/api/admin/customers/?limit=1000')).data as Customer[] });
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({ queryKey: ['admin-products-lite'], queryFn: async () => (await api.get('/api/admin/products/?limit=1000')).data as Product[] });

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Order['status'] }) => (await api.put(`/api/admin/orders/${id}`, { status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const { mutate: deleteOrder, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/orders/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      setConfirmDelete(null);
    },
  });

  const { mutate: createOrder, isPending: isCreating } = useMutation({
    mutationFn: async (payload: { customerId: number; items: { productId: number; quantity: number }[]; status: Order['status'] }) => {
      return (await api.post('/api/orders', payload)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      setOpenCreate(false);
    },
  });

  const [confirmDelete, setConfirmDelete] = useState<Order | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <div className="card">
      <div className="card-padding">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Orders</h2>
          <button onClick={() => setOpenCreate(true)} className="brand-bg text-white rounded-lg px-4 py-2 font-medium shadow hover:opacity-95 active:scale-[0.98] transition-all">Add Order</button>
        </div>
        {isLoadingOrders ? (
          <div className="h-96 flex items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.orderId} className={i % 2 ? 'bg-slate-50' : ''}>
                  <td className="py-2 pr-4">{o.orderId}</td>
                  <td className="py-2 pr-4">{o.customer?.name}</td>
                  <td className="py-2 pr-4">
                    <select value={o.status} onChange={(e) => updateStatus.mutate({ id: o.orderId, status: e.target.value as Order['status'] })} className="rounded-lg border border-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]">
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-4">${o.totalAmount}</td>
                  <td className="py-2 pr-4">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="py-2 pr-4">
                    <button onClick={() => setConfirmDelete(o)} className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateOrderModal open={openCreate} onClose={() => setOpenCreate(false)} onCreate={(payload) => createOrder.mutate(payload)} customers={customers} products={products} />

      <ConfirmDialog open={!!confirmDelete} title="Delete Order" onCancel={() => setConfirmDelete(null)} onConfirm={() => { if (confirmDelete) deleteOrder.mutate(confirmDelete.orderId); setConfirmDelete(null) }} message={<span>Are you sure you want to delete order <b>#{confirmDelete?.orderId}</b>?</span>} />
    </div>
  )
}

function CreateOrderModal({ open, onClose, onCreate, customers, products }: { open: boolean; onClose: () => void; onCreate: (p: { customerId: number; items: { productId: number; quantity: number }[]; status?: typeof STATUSES[number] }) => void; customers: Customer[]; products: Product[] }) {
  const [customerId, setCustomerId] = useState<number | ''>('')
  const [status, setStatus] = useState<typeof STATUSES[number]>('PENDING')
  const [productId, setProductId] = useState<number | ''>('')
  const [qty, setQty] = useState(1)
  const [items, setItems] = useState<{ productId: number; quantity: number }[]>([])

  const mapById = useMemo(() => Object.fromEntries(products.map(p => [p.productId, p])), [products])
  const total = useMemo(() => items.reduce((sum, it) => sum + (mapById[it.productId]?.price || 0) * it.quantity, 0), [items, mapById])

  function addItem() {
    if (!productId || qty <= 0) return
    setItems((prev) => {
      const exists = prev.find((i) => i.productId === productId)
      if (exists) return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + qty } : i)
      return [...prev, { productId: productId as number, quantity: qty }]
    })
    setProductId('')
    setQty(1)
  }
  function removeItem(id: number) { setItems((prev) => prev.filter(i => i.productId !== id)) }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!customerId || items.length === 0) return
    onCreate({ customerId: customerId as number, items, status })
    setItems([])
    setCustomerId('')
    setStatus('PENDING')
    onClose()
  }

  return (
    <Modal open={open} title="Create Order" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-slate-700">Customer</span>
            <select value={customerId} onChange={(e) => setCustomerId(Number(e.target.value) || '')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]">
              <option value="">Select customer</option>
              {customers.map(c => <option key={c.customerId} value={c.customerId}>{c.name} (#{c.customerId})</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof STATUSES[number])} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Add Products</div>
          <div className="flex gap-2">
            <select value={productId} onChange={(e) => setProductId(Number(e.target.value) || '')} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]">
              <option value="">Select product</option>
              {products.map(p => <option key={p.productId} value={p.productId}>{p.name} — ${p.price}</option>)}
            </select>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} className="w-24 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
            <button type="button" onClick={addItem} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-[0.98]">Add</button>
          </div>
          <div className="max-h-56 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Subtotal</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {items.map((it) => (
                    <motion.tr key={it.productId} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                      <td className="py-2 pr-4">{mapById[it.productId]?.name}</td>
                      <td className="py-2 pr-4">{it.quantity}</td>
                      <td className="py-2 pr-4">${mapById[it.productId]?.price?.toFixed(2)}</td>
                      <td className="py-2 pr-4">${((mapById[it.productId]?.price || 0) * it.quantity).toFixed(2)}</td>
                      <td className="py-2 pr-4 text-right"><button type="button" onClick={() => removeItem(it.productId)} className="px-2 py-1 rounded-md border border-red-300 text-red-700 hover:bg-red-50">Remove</button></td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          <div className="flex justify-end text-sm text-slate-700">Total: <span className="ml-2 font-medium">${total.toFixed(2)}</span></div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</button>
          <button disabled={!customerId || items.length === 0} className="px-4 py-2 rounded-lg brand-bg text-white shadow hover:opacity-95 active:scale-[0.98]">Create Order</button>
        </div>
      </form>
    </Modal>
  )
}
