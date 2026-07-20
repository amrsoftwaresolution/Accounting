import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import CommonButton from '@/Components/CommonButton';

export default function POSIndex({ auth, items, customers, paymentMethods, depositAccounts, defaultDepositAccount, nextReceiptNo }) {
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        customer: '',
        email: '',
        billingAddress: '',
        receiptDate: new Date().toISOString().split('T')[0],
        receiptNo: nextReceiptNo,
        paymentMethod: paymentMethods.length > 0 ? paymentMethods[0].id : '',
        depositTo: defaultDepositAccount ? defaultDepositAccount.id : '',
        memo: 'POS Sale',
        statementMessage: '',
        items: []
    });

    // Filter items based on search
    const filteredItems = useMemo(() => {
        if (!searchQuery) return items;
        return items.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [items, searchQuery]);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.product === item.id);
            if (existing) {
                return prev.map(i => i.product === item.id ? { ...i, qty: i.qty + 1, amount: (i.qty + 1) * Number(i.rate) } : i);
            }
            return [...prev, {
                product: item.id,
                name: item.name,
                description: item.description || '',
                qty: 1,
                rate: Number(item.sale_price),
                amount: Number(item.sale_price),
            }];
        });
    };

    const updateCartQty = (productId, delta) => {
        setCart(prev => prev.map(i => {
            if (i.product === productId) {
                const newQty = Math.max(1, i.qty + delta);
                return { ...i, qty: newQty, amount: newQty * Number(i.rate) };
            }
            return i;
        }));
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(i => i.product !== productId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.amount, 0);

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert("Cart is empty!");
            return;
        }

        // Merge cart into form data before posting
        data.items = cart.map(c => ({
            product: c.product,
            description: c.name,
            qty: c.qty,
            rate: c.rate,
            amount: c.amount,
        }));

        post(route('receipt.store'), {
            onSuccess: () => {
                alert('Sale completed successfully!');
                setCart([]);
                reset('customer', 'email', 'billingAddress');
            },
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header="POS Billing">
            <Head title="Point of Sale" />

            <div className="h-[calc(100vh-65px)] flex overflow-hidden bg-slate-100">
                
                {/* Left Side - Catalog */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10 flex gap-4 items-center">
                        <div className="relative flex-1 max-w-md">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Search products or services..."
                                className="w-full pl-10 pr-4 py-2 border-slate-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredItems.map(item => (
                                <div 
                                    key={item.id} 
                                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all flex flex-col h-full active:scale-95"
                                    onClick={() => addToCart(item)}
                                >
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.type}</div>
                                        <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug">{item.name}</h3>
                                        {item.sku && <p className="text-xs text-slate-500 mt-1">{item.sku}</p>}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <span className="font-black text-blue-600">Rs. {Number(item.sale_price).toFixed(2)}</span>
                                        <span className="material-symbols-outlined text-slate-300">add_circle</span>
                                    </div>
                                </div>
                            ))}
                            {filteredItems.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-500">
                                    No products found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side - Cart & Checkout */}
                <div className="w-[400px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h2 className="font-bold text-slate-800">Current Order</h2>
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{cart.length} items</span>
                    </div>

                    <div className="p-4 border-b border-slate-200 bg-white">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Customer (Optional)</label>
                        <select 
                            className="w-full text-sm border-slate-300 rounded-md shadow-sm mb-3"
                            value={data.customer}
                            onChange={e => setData('customer', e.target.value)}
                        >
                            <option value="">Walk-in Customer</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.display_name}</option>
                            ))}
                        </select>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pay Method</label>
                                <select 
                                    className="w-full text-xs border-slate-300 rounded-md"
                                    value={data.paymentMethod}
                                    onChange={e => setData('paymentMethod', e.target.value)}
                                >
                                    {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deposit To</label>
                                <select 
                                    className="w-full text-xs border-slate-300 rounded-md"
                                    value={data.depositTo}
                                    onChange={e => setData('depositTo', e.target.value)}
                                >
                                    {depositAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">shopping_cart</span>
                                <p>Order is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item.product} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-slate-800 leading-tight">{item.name}</h4>
                                            <p className="text-xs text-slate-500 mt-1">Rs. {Number(item.rate).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                                            <button onClick={() => updateCartQty(item.product, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-slate-900">-</button>
                                            <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                                            <button onClick={() => updateCartQty(item.product, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-slate-900">+</button>
                                        </div>
                                        <div className="text-right flex flex-col items-end justify-between h-full">
                                            <span className="font-bold text-sm text-slate-900">Rs. {item.amount.toFixed(2)}</span>
                                            <button onClick={() => removeFromCart(item.product)} className="text-[10px] text-red-500 hover:text-red-700 mt-2 flex items-center">
                                                <span className="material-symbols-outlined text-[14px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-slate-500 font-bold uppercase tracking-wider">Total Amount</span>
                            <span className="text-3xl font-black text-blue-600">Rs. {totalAmount.toFixed(2)}</span>
                        </div>
                        
                        <CommonButton 
                            variant="primary" 
                            className="w-full py-4 text-lg justify-center flex gap-2 items-center" 
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                            processing={processing}
                        >
                            <span className="material-symbols-outlined">point_of_sale</span>
                            Complete Sale
                        </CommonButton>

                        {Object.keys(errors).length > 0 && (
                            <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">
                                There was an error completing the sale. Check your inputs.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
