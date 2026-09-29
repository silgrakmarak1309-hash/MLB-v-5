import React from 'react';
import {
  DeliveryOrder,
  UserProfile,
  formatPrice,
} from '../types';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  XCircle,
} from 'lucide-react';

interface BuyerOrdersManagementProps {
  currentUser: UserProfile;
  orders?: DeliveryOrder[];
  onConfirmDeliverySuccess: (orderId: string) => Promise<void> | void;
  onCancelOrder?: (orderId: string, reason?: string, refundAmount?: number, deliveryChargeRefund?: number) => Promise<void> | void;
  onExploreMarketplace: () => void;
  onOpenPolicyModal: () => void;
}

export const BuyerOrdersManagement: React.FC<BuyerOrdersManagementProps> = ({
  currentUser,
  orders = [],
  onConfirmDeliverySuccess,
  onCancelOrder,
  onExploreMarketplace,
  onOpenPolicyModal,
}) => {
  const myOrders = orders.filter(
    (o) =>
      (o.buyer_id && o.buyer_id === currentUser.id) ||
      (o.buyer_phone && currentUser.phone && o.buyer_phone.trim() === currentUser.phone.trim())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">My Orders & Live Tracking</h2>
          <p className="text-xs text-slate-500">Track real-time delivery status across Meghalaya</p>
        </div>
        <button
          onClick={onExploreMarketplace}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start cursor-pointer shadow-md shadow-orange-600/20"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Explore Items</span>
        </button>
      </div>

      {myOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse items in the marketplace and choose Home Delivery at checkout.
          </p>
          <button
            onClick={onExploreMarketplace}
            className="mt-3 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer hover:bg-slate-800"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => {
            const isDelivered = order.status === 'delivered';
            const isCancelled = order.status === 'cancelled';
            const isPickedUp = order.status === 'picked_up';
            const isAccepted = order.status === 'accepted';
            const isPending = order.status === 'pending';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-600'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-orange-100 text-orange-600 animate-pulse'
                      }`}
                    >
                      {isDelivered && <CheckCircle2 className="w-5 h-5" />}
                      {isCancelled && <XCircle className="w-5 h-5" />}
                      {!isDelivered && !isCancelled && <Truck className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">
                          Order #{order.id ? order.id.slice(-6).toUpperCase() : 'ORD'}
                        </h4>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-700'
                              : isCancelled
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {order.created_at ? new Date(order.created_at).toLocaleString() : 'Recent'}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-sm font-black text-slate-900">
                      ₹{formatPrice((order.item_price ?? order.product_price ?? 0) + (order.delivery_fee || 0))}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Item: ₹{formatPrice(order.item_price ?? order.product_price ?? 0)} + Delivery: ₹{formatPrice(order.delivery_fee || 0)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-orange-600" />
                      <span>{order.listing_title || 'Item Description'}</span>
                    </div>
                    <div className="text-slate-600">
                      <span className="text-slate-400">Seller:</span> {order.seller_name || 'Local Seller'}
                    </div>
                    {order.seller_phone && (
                      <div className="text-slate-600 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{order.seller_phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Delivery Address</span>
                    </div>
                    <p className="text-slate-600 leading-snug">
                      {order.delivery_address || `${order.block || ''}, ${order.district || ''}, Meghalaya`}
                    </p>
                    {order.delivery_partner_name && (
                      <div className="text-slate-600 pt-1">
                        <span className="text-slate-400">Delivery Partner:</span>{' '}
                        <strong className="text-slate-800">{order.delivery_partner_name}</strong>
                        {order.delivery_partner_phone && ` (${order.delivery_partner_phone})`}
                      </div>
                    )}
                  </div>
                </div>

                {!isDelivered && !isCancelled && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {onCancelOrder && isPending && (
                      <button
                        onClick={() => onCancelOrder(order.id)}
                        className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}
                    <button
                      onClick={() => onConfirmDeliverySuccess(order.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Delivery Received</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
