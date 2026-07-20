import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import CommonButton from '@/Components/CommonButton';
import QuickAddPayee from '@/Components/QuickAddPayee';

export default function POSIndex({ auth, items, customers, paymentMethods, depositAccounts, defaultDepositAccount, nextReceiptNo }) {
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'service'
    
    // Quick Add
    const [isQuickCustomerOpen, setIsQuickCustomerOpen] = useState(false);
    
    // Drafts
    const [drafts, setDrafts] = useState([]);
    const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);

    useEffect(() => {
        const savedDrafts = JSON.parse(localStorage.getItem('pos_drafts') || '[]');
        setDrafts(savedDrafts);
    }, []);

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
        repairingCost: 0,
        items: []
    });

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            if (activeTab && item.type !== activeTab) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return item.name.toLowerCase().includes(q) || (item.sku && item.sku.toLowerCase().includes(q));
            }
            return true;
        });
    }, [items, searchQuery, activeTab]);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.product === item.id);
            if (existing) {
                return prev.map(i => {
                    if (i.product === item.id) {
                        const newQty = i.qty + 1;
                        const amtBeforeDiscount = newQty * Number(i.rate);
                        const discountAmt = amtBeforeDiscount * (i.discount / 100);
                        return { ...i, qty: newQty, amount: amtBeforeDiscount - discountAmt };
                    }
                    return i;
                });
            }
            return [...prev, {
                product: item.id,
                name: item.name,
                description: item.description || '',
                qty: 1,
                rate: Number(item.sale_price),
                discount: 0, // percentage
                amount: Number(item.sale_price),
            }];
        });
    };

    const updateCartQty = (productId, delta) => {
        setCart(prev => prev.map(i => {
            if (i.product === productId) {
                const newQty = Math.max(1, i.qty + delta);
                const amtBeforeDiscount = newQty * Number(i.rate);
                const discountAmt = amtBeforeDiscount * (i.discount / 100);
                return { ...i, qty: newQty, amount: amtBeforeDiscount - discountAmt };
            }
            return i;
        }));
    };

    const updateCartDiscount = (productId, discountPct) => {
        setCart(prev => prev.map(i => {
            if (i.product === productId) {
                const pct = Math.max(0, Math.min(100, Number(discountPct) || 0));
                const amtBeforeDiscount = i.qty * Number(i.rate);
                const discountAmt = amtBeforeDiscount * (pct / 100);
                return { ...i, discount: pct, amount: amtBeforeDiscount - discountAmt };
            }
            return i;
        }));
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(i => i.product !== productId));
    };

    const cartSubtotal = cart.reduce((sum, item) => sum + item.amount, 0);
    const repairingCostNum = Number(data.repairingCost) || 0;
    const totalAmount = cartSubtotal + repairingCostNum;

    const handleCheckout = (action = 'cash_sale') => {
        if (cart.length === 0 && repairingCostNum === 0) {
            alert("Cart is empty!");
            return;
        }

        // Merge cart into form data
        data.items = cart.map(c => ({
            product: c.product,
            description: c.name,
            qty: c.qty,
            rate: c.rate,
            discount: c.discount,
            amount: c.amount,
        }));

        if (action === 'credit_sale') {
            data.action = 'credit_sale';
        }

        post(route('receipt.store'), {
            onSuccess: () => {
                alert(action === 'credit_sale' ? 'Credit Sale completed successfully!' : 'Sale completed successfully!');
                setCart([]);
                reset('customer', 'email', 'billingAddress', 'repairingCost', 'action');
            },
            preserveScroll: true
        });
    };

    const saveDraft = () => {
        if (cart.length === 0 && repairingCostNum === 0) {
            alert("Nothing to hold.");
            return;
        }
        const draft = {
            id: Date.now().toString(),
            date: new Date().toLocaleString(),
            customer: data.customer,
            repairingCost: data.repairingCost,
            cart: cart,
            total: totalAmount
        };
        const updatedDrafts = [draft, ...drafts];
        localStorage.setItem('pos_drafts', JSON.stringify(updatedDrafts));
        setDrafts(updatedDrafts);
        setCart([]);
        reset('customer', 'repairingCost');
        alert("Sale saved to Hold/Drafts.");
    };

    const restoreDraft = (draftId) => {
        const draft = drafts.find(d => d.id === draftId);
        if (draft) {
            setData('customer', draft.customer || '');
            setData('repairingCost', draft.repairingCost || 0);
            setCart(draft.cart || []);
            
            const updatedDrafts = drafts.filter(d => d.id !== draftId);
            localStorage.setItem('pos_drafts', JSON.stringify(updatedDrafts));
            setDrafts(updatedDrafts);
            setIsDraftsModalOpen(false);
        }
    };

    const deleteDraft = (draftId) => {
        const updatedDrafts = drafts.filter(d => d.id !== draftId);
        localStorage.setItem('pos_drafts', JSON.stringify(updatedDrafts));
        setDrafts(updatedDrafts);
    };

    return (
        <AuthenticatedLayout user={auth.user} header="POS Billing" hideSidebar={true}>
            <Head title="Point of Sale" />

            {/* Top Bar inside the viewport (since sidebar is hidden, we have full width) */}
            <div className="h-[calc(100vh-56px)] flex overflow-hidden bg-slate-100 relative">
                
                {/* Close Button overlay */}
                <Link 
                    href={route('dashboard')} 
                    className="absolute top-4 right-[360px] z-50 bg-white border border-slate-200 text-slate-500 hover:text-red-500 p-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                    title="Close POS"
                >
                    <span className="material-symbols-outlined leading-none">close</span>
                </Link>

                {/* Left Side - Catalog */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-3 bg-white border-b border-slate-200 shadow-sm z-10 flex gap-3 items-center justify-between">
                        
                        {/* Tab Switcher */}
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button 
                                onClick={() => setActiveTab('inventory')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'inventory' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Products
                            </button>
                            <button 
                                onClick={() => setActiveTab('service')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'service' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Services
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 max-w-sm">
                            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                            <input
                                type="text"
                                placeholder={`Search ${activeTab === 'inventory' ? 'products' : 'services'}...`}
                                className="w-full pl-9 pr-3 py-1.5 text-sm border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {filteredItems.map(item => (
                                <div 
                                    key={item.id} 
                                    className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all flex flex-col h-full active:scale-95"
                                    onClick={() => addToCart(item)}
                                >
                                    <div className="flex-1 mb-2">
                                        <h3 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug">{item.name}</h3>
                                        {item.sku && <p className="text-[10px] text-slate-400 mt-0.5">{item.sku}</p>}
                                    </div>
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                        <span className="font-black text-blue-600 text-sm">Rs. {Number(item.sale_price).toFixed(2)}</span>
                                        <span className="text-xl font-bold text-slate-300 group-hover:text-blue-500 leading-none">+</span>
                                    </div>
                                </div>
                            ))}
                            {filteredItems.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-500">
                                    No {activeTab} found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side - Cart & Checkout (Compact) */}
                <div className="w-[340px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
                    
                    <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                            Current Order <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{cart.length}</span>
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={() => setIsDraftsModalOpen(true)} className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-2 py-1 rounded">
                                View Holds ({drafts.length})
                            </button>
                            <button onClick={saveDraft} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-100 px-2 py-1 rounded">
                                Hold Sale
                            </button>
                        </div>
                    </div>

                    <div className="p-3 border-b border-slate-200 bg-white space-y-2">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">Customer (Optional)</label>
                                <button onClick={() => setIsQuickCustomerOpen(true)} className="text-[10px] text-blue-600 font-bold hover:underline">
                                    + Add New
                                </button>
                            </div>
                            <select 
                                className="w-full text-xs py-1 border-slate-300 rounded shadow-sm"
                                value={data.customer}
                                onChange={e => setData('customer', e.target.value)}
                            >
                                <option value="">Walk-in Customer</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.display_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Pay Method</label>
                                <select 
                                    className="w-full text-xs py-1 border-slate-300 rounded"
                                    value={data.paymentMethod}
                                    onChange={e => setData('paymentMethod', e.target.value)}
                                >
                                    {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Deposit To</label>
                                <select 
                                    className="w-full text-xs py-1 border-slate-300 rounded"
                                    value={data.depositTo}
                                    onChange={e => setData('depositTo', e.target.value)}
                                >
                                    {depositAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 bg-slate-50">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                                <p>Order is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {cart.map(item => (
                                    <div key={item.product} className="bg-white p-2 rounded border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-xs text-slate-800 leading-tight">{item.name}</h4>
                                                <p className="text-[10px] text-slate-500">Rs. {Number(item.rate).toFixed(2)}</p>
                                            </div>
                                            <button onClick={() => removeFromCart(item.product)} className="text-slate-300 hover:text-red-500 leading-none px-1">
                                                &times;
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 bg-slate-100 rounded p-0.5">
                                                <button onClick={() => updateCartQty(item.product, -1)} className="w-5 h-5 flex items-center justify-center bg-white rounded text-slate-600 text-xs shadow-sm">-</button>
                                                <span className="text-xs font-bold w-5 text-center">{item.qty}</span>
                                                <button onClick={() => updateCartQty(item.product, 1)} className="w-5 h-5 flex items-center justify-center bg-white rounded text-slate-600 text-xs shadow-sm">+</button>
                                            </div>
                                            
                                            <div className="flex items-center gap-1">
                                                <span className="text-[9px] text-slate-400">Disc %:</span>
                                                <input 
                                                    type="number" 
                                                    className="w-12 text-xs py-0.5 px-1 border-slate-300 rounded text-right"
                                                    value={item.discount}
                                                    onChange={(e) => updateCartDiscount(item.product, e.target.value)}
                                                    min="0" max="100"
                                                />
                                            </div>

                                            <span className="font-bold text-xs text-slate-900">Rs. {item.amount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-white border-t border-slate-200">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Additional Repair Cost</label>
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-slate-400">Rs.</span>
                                <input 
                                    type="number" 
                                    className="w-20 text-xs py-1 px-2 border-slate-300 rounded text-right font-bold"
                                    value={data.repairingCost}
                                    onChange={e => setData('repairingCost', e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
                            <span className="text-xl font-black text-blue-600">Rs. {totalAmount.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex gap-2">
                            <CommonButton 
                                variant="secondary" 
                                className="w-1/3 py-2.5 text-xs justify-center font-bold border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100" 
                                onClick={() => handleCheckout('credit_sale')}
                                disabled={cart.length === 0 && repairingCostNum === 0}
                                processing={processing && data.action === 'credit_sale'}
                            >
                                Credit Sale
                            </CommonButton>
                            
                            <CommonButton 
                                variant="primary" 
                                className="w-2/3 py-2.5 text-sm justify-center font-bold" 
                                onClick={() => handleCheckout('cash_sale')}
                                disabled={cart.length === 0 && repairingCostNum === 0}
                                processing={processing && data.action !== 'credit_sale'}
                            >
                                Complete Sale
                            </CommonButton>
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div className="mt-2 p-2 bg-red-50 text-red-700 text-[10px] rounded border border-red-100">
                                Error completing sale.
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Modals */}
            <QuickAddPayee 
                isOpen={isQuickCustomerOpen}
                onClose={() => setIsQuickCustomerOpen(false)}
                type="customer"
                hideEmployeeTab={true}
                onAdd={(newCustomer) => {
                    router.reload({
                        only: ['customers'],
                        onSuccess: () => {
                            setData('customer', newCustomer.id);
                        }
                    });
                }}
            />

            {isDraftsModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Held Sales</h3>
                            <button onClick={() => setIsDraftsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            {drafts.length === 0 ? (
                                <p className="text-center text-slate-500 text-sm py-8">No held sales found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {drafts.map(draft => {
                                        const custName = draft.customer ? customers.find(c => c.id == draft.customer)?.display_name : 'Walk-in Customer';
                                        return (
                                            <div key={draft.id} className="border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="font-bold text-sm text-slate-800">{custName}</div>
                                                        <div className="text-[10px] text-slate-500">{draft.date}</div>
                                                    </div>
                                                    <div className="font-black text-blue-600 text-sm">Rs. {Number(draft.total).toFixed(2)}</div>
                                                </div>
                                                <div className="text-xs text-slate-600 mb-3">
                                                    {draft.cart.length} items {Number(draft.repairingCost) > 0 && `+ Repair Cost (Rs. ${draft.repairingCost})`}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => restoreDraft(draft.id)} className="flex-1 bg-blue-50 text-blue-700 text-xs font-bold py-1.5 rounded hover:bg-blue-100">
                                                        Restore Sale
                                                    </button>
                                                    <button onClick={() => deleteDraft(draft.id)} className="px-3 bg-red-50 text-red-600 text-xs font-bold py-1.5 rounded hover:bg-red-100">
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
