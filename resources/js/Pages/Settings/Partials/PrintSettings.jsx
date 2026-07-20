import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

const SettingsSection = ({ title, children, isEditing, onEditClick, fullWidth = false }) => (
    <div className="bg-white rounded shadow-sm border border-gray-200 mb-3 group relative">
        <div className="p-5">
            {fullWidth && isEditing ? (
                <div className="flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wider">{title}</h3>
                    </div>
                    <div className="w-full">
                        {children}
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-start">
                    <div className="w-1/3">
                        <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wider">{title}</h3>
                    </div>
                    <div className="w-2/3 pr-12">
                        {children}
                    </div>
                </div>
            )}
        </div>
        {!isEditing && (
            <button
                type="button"
                onClick={onEditClick}
                className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <span className="material-icons text-primary-600 text-sm">edit</span>
            </button>
        )}
    </div>
);

const Row = ({ label, value, isBoldValue = true }) => (
    <div className="flex justify-between py-1.5 text-xs border-b border-gray-50 last:border-0">
        <span className="text-gray-600">{label}</span>
        <span className={`${isBoldValue ? 'font-semibold' : ''} text-gray-800`}>{value}</span>
    </div>
);

const AVAILABLE_BLOCKS = {
    logo: "Company Logo",
    company_name: "Company Name",
    title: "Document Title",
    company_details: "Company Details",
    document_info: "Document Info (No, Date)",
    bill_to: "Bill To Address",
    shipping_to: "Shipping Address",
    items_table: "Items Table",
    totals: "Totals & Balances",
    static_content: "Footer Text",
};

const DEFAULT_LAYOUT = {
    header_left: ["logo", "company_name", "company_details"],
    header_right: ["title", "document_info"],
    body: ["bill_to", "shipping_to", "items_table"],
    footer_left: ["static_content"],
    footer_right: ["totals"],
};

const DEFAULT_PAGE_SETUP = {
    size: 'A4',
    background_color: '#ffffff',
    background_image: '',
    margin_top: 10,
    margin_bottom: 10,
    margin_left: 10,
    margin_right: 10,
};

const BlockPreview = ({ blockId, data, currencyPrefix }) => {
    const primaryColor = data.primary_color || '#111827';
    const globalTextColor = data.text_color || '#374151';

    // Apply specific styles if any
    const styles = data.block_styles?.[blockId] || {};
    const textColor = styles.color || globalTextColor;

    const inlineStyle = {
        color: textColor,
        fontSize: styles.fontSize ? `${styles.fontSize}px` : undefined,
        fontWeight: styles.bold ? 'bold' : 'normal',
        fontStyle: styles.italic ? 'italic' : 'normal',
        textDecoration: styles.underline ? 'underline' : 'none',
        textAlign: styles.textAlign || 'left',
    };

    switch (blockId) {
        case 'logo':
            const logoHeight = styles.logoHeight ? `${styles.logoHeight}px` : '64px';
            return (
                <div style={{ textAlign: styles.textAlign || 'left', width: '100%' }}>
                    {data.companyLogoUrl ? (
                        <img src={data.companyLogoUrl} alt="Company Logo" className="mb-4" style={{ maxHeight: logoHeight, display: 'inline-block' }} />
                    ) : (
                        <div className="mb-2 bg-gray-200 inline-flex items-center justify-center text-gray-400 text-[10px] uppercase font-bold text-center border-2 border-dashed border-gray-300" style={{ height: logoHeight, width: logoHeight }}>Logo<br/>Space</div>
                    )}
                </div>
            );
        case 'company_name':
            return <div className="uppercase tracking-wider mb-2" style={{...inlineStyle, fontSize: styles.fontSize ? `${styles.fontSize}px` : '24px', fontWeight: styles.bold ? 'bold' : 'bold'}}>Demo Company</div>;
        case 'company_details':
            return (
                <div className="opacity-80" style={{...inlineStyle, fontSize: styles.fontSize ? `${styles.fontSize}px` : '14px'}}>
                    123 Main St<br/>City, Country<br/>demo@company.com<br/>+1 234 567 890
                </div>
            );
        case 'title':
            return <h1 className="uppercase tracking-widest mb-4" style={{...inlineStyle, color: styles.color || primaryColor, fontSize: styles.fontSize ? `${styles.fontSize}px` : '30px', fontWeight: styles.bold ? 'bold' : 'bold'}}>{data.custom_title || 'Document Title'}</h1>;
        case 'document_info':
            return (
                <div style={{...inlineStyle, fontSize: styles.fontSize ? `${styles.fontSize}px` : '14px'}}>
                    <p className="mb-1"><span className="opacity-80 font-semibold" style={{color: primaryColor, fontSize: styles.labelSize ? `${styles.labelSize}px` : undefined}}>No:</span> <span className="font-bold" style={{color: primaryColor}}>#INV-0001</span></p>
                    <p className="mb-1"><span className="opacity-80 font-semibold" style={{color: primaryColor, fontSize: styles.labelSize ? `${styles.labelSize}px` : undefined}}>Date:</span> <span className="font-bold" style={{color: primaryColor}}>Jul 16, 2026</span></p>
                    <p className="mb-1"><span className="opacity-80 font-semibold" style={{color: primaryColor, fontSize: styles.labelSize ? `${styles.labelSize}px` : undefined}}>Due Date:</span> <span className="font-bold" style={{color: primaryColor}}>Jul 30, 2026</span></p>
                </div>
            );
        case 'bill_to':
            return (
                <div className="mb-8" style={inlineStyle}>
                    <h3 className="uppercase tracking-wider mb-2 opacity-60" style={{color: primaryColor, fontSize: styles.titleFontSize ? `${styles.titleFontSize}px` : (styles.fontSize ? `${Math.max(10, styles.fontSize - 2)}px` : '12px'), fontWeight: 'bold'}}>Bill To</h3>
                    <div className="font-semibold" style={{color: primaryColor, fontSize: styles.nameFontSize ? `${styles.nameFontSize}px` : (styles.fontSize ? `${styles.fontSize + 4}px` : '18px')}}>John Doe</div>
                    <div className="mt-1" style={{fontSize: styles.fontSize ? `${styles.fontSize}px` : '14px', color: textColor}}>
                        456 Customer Ave<br/>Customer City, ST 12345<br/>john.doe@example.com
                    </div>
                </div>
            );
        case 'shipping_to':
            return (
                <div className="mb-8" style={inlineStyle}>
                    <h3 className="uppercase tracking-wider mb-2 opacity-60" style={{color: primaryColor, fontSize: styles.titleFontSize ? `${styles.titleFontSize}px` : (styles.fontSize ? `${Math.max(10, styles.fontSize - 2)}px` : '12px'), fontWeight: 'bold'}}>Ship To</h3>
                    <div className="mt-1" style={{fontSize: styles.fontSize ? `${styles.fontSize}px` : '14px', color: textColor}}>
                        456 Customer Ave<br/>Customer City, ST 12345
                    </div>
                </div>
            );
        case 'items_table':
            return (
                <table className="w-full text-left border-collapse mb-8" style={{...inlineStyle, fontSize: styles.fontSize ? `${styles.fontSize}px` : '14px', color: textColor}}>
                    <thead>
                        <tr className="border-b-2" style={{borderColor: primaryColor}}>
                            <th className="py-2 px-2 font-bold w-1/2" style={{color: primaryColor, fontSize: styles.headingFontSize ? `${styles.headingFontSize}px` : undefined}}>Description</th>
                            <th className="py-2 px-2 font-bold text-right" style={{color: primaryColor, fontSize: styles.headingFontSize ? `${styles.headingFontSize}px` : undefined}}>Qty</th>
                            <th className="py-2 px-2 font-bold text-right" style={{color: primaryColor, fontSize: styles.headingFontSize ? `${styles.headingFontSize}px` : undefined}}>Rate</th>
                            <th className="py-2 px-2 font-bold text-right" style={{color: primaryColor, fontSize: styles.headingFontSize ? `${styles.headingFontSize}px` : undefined}}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-200" style={{fontSize: styles.rowFontSize ? `${styles.rowFontSize}px` : undefined}}>
                            <td className="py-2 px-2">
                                <div className="font-semibold">Sample Item</div>
                                <div className="opacity-70 mt-1" style={{fontSize: '0.85em'}}>Sample description</div>
                            </td>
                            <td className="py-2 px-2 text-right">2</td>
                            <td className="py-2 px-2 text-right">{currencyPrefix}150.00</td>
                            <td className="py-2 px-2 text-right font-semibold" style={{color: primaryColor}}>{currencyPrefix}300.00</td>
                        </tr>
                        <tr className="border-b border-gray-200" style={{fontSize: styles.rowFontSize ? `${styles.rowFontSize}px` : undefined}}>
                            <td className="py-2 px-2">
                                <div className="font-semibold">Sample Service</div>
                            </td>
                            <td className="py-2 px-2 text-right">1</td>
                            <td className="py-2 px-2 text-right">{currencyPrefix}500.00</td>
                            <td className="py-2 px-2 text-right font-semibold" style={{color: primaryColor}}>{currencyPrefix}500.00</td>
                        </tr>
                    </tbody>
                </table>
            );
        case 'totals':
            return (
                <div className="border-t-2 mt-2 min-w-[200px]" style={{...inlineStyle, borderColor: primaryColor}}>
                    <div className="flex justify-between py-2 font-bold" style={{color: primaryColor, fontSize: styles.fontSize ? `${styles.fontSize + 4}px` : '20px'}}>
                        <span>Total</span>
                        <span>{currencyPrefix}800.00</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200" style={{color: textColor, fontSize: styles.fontSize ? `${styles.fontSize}px` : '16px'}}>
                        <span>Balance Due</span>
                        <span className="font-semibold" style={{color: primaryColor}}>{currencyPrefix}800.00</span>
                    </div>
                </div>
            );
        case 'static_content':
            return (
                <div style={inlineStyle}>
                    <div className="mb-4">
                        <h4 className="uppercase tracking-wider mb-1 opacity-60" style={{color: primaryColor, fontSize: styles.fontSize ? `${Math.max(10, styles.fontSize - 2)}px` : '12px', fontWeight: 'bold'}}>Memo / Notes</h4>
                        <p style={{fontSize: styles.fontSize ? `${styles.fontSize}px` : '14px', color: textColor}}>Thank you for your business.</p>
                    </div>
                    {data.static_footer_content && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div style={{fontSize: styles.fontSize ? `${styles.fontSize}px` : '14px', color: textColor}}>
                                {data.static_footer_content.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}
                            </div>
                        </div>
                    )}
                </div>
            );
        default:
            return <div>{blockId}</div>;
    }
};

export default function PrintSettings({ printSettings = [], companySettings = {} }) {
    const [selectedDocType, setSelectedDocType] = useState('invoice');
    const [editingSection, setEditingSection] = useState('layout'); // Default to layout editing
    const [selectedBlock, setSelectedBlock] = useState(null);
    const currencyPrefix = companySettings?.home_currency_prefix || 'LKR ';

    const docTypes = [
        { value: 'invoice', label: 'Sales Invoice' },
        { value: 'payment_receipt', label: 'Payment Receipt' },
        { value: 'bill', label: 'Purchase Bill' },
        { value: 'payment_voucher', label: 'Payment Voucher' },
        { value: 'supplier_credit', label: 'Supplier Return Note' },
        { value: 'credit_note', label: 'Credit Note' },
    ];

    const { data, setData, post, processing } = useForm({
        document_type: 'invoice',
        custom_title: '',
        static_footer_content: '',
        layout_config: DEFAULT_LAYOUT,
        primary_color: '#111827',
        text_color: '#374151',
        page_setup: DEFAULT_PAGE_SETUP,
        block_styles: {},
    });

    useEffect(() => {
        const currentSetting = printSettings.find(s => s.document_type === selectedDocType);
        
        setData({
            document_type: selectedDocType,
            custom_title: currentSetting?.custom_title || '',
            static_footer_content: currentSetting?.static_footer_content || '',
            layout_config: currentSetting?.layout_config || DEFAULT_LAYOUT,
            primary_color: currentSetting?.primary_color || '#111827',
            text_color: currentSetting?.text_color || '#374151',
            page_setup: currentSetting?.page_setup || DEFAULT_PAGE_SETUP,
            block_styles: currentSetting?.block_styles || {},
        });
        setSelectedBlock(null);
    }, [selectedDocType, printSettings]);

    const submit = (e) => {
        e.preventDefault();
        post(route('print.settings.update'), {
            preserveScroll: true,
            onSuccess: () => setEditingSection('layout'), // Stay on layout mode
        });
    };

    const handleDragStart = (e, blockId, sourceZone) => {
        e.dataTransfer.setData('blockId', blockId);
        e.dataTransfer.setData('sourceZone', sourceZone);
    };

    const handleDrop = (e, targetZone) => {
        e.preventDefault();
        const blockId = e.dataTransfer.getData('blockId');
        const sourceZone = e.dataTransfer.getData('sourceZone');

        if (!blockId || sourceZone === targetZone) return;

        setData(prev => {
            const newLayout = { ...prev.layout_config };
            
            if (sourceZone !== 'available') {
                newLayout[sourceZone] = newLayout[sourceZone].filter(id => id !== blockId);
            }
            if (targetZone !== 'available') {
                if (!newLayout[targetZone]) newLayout[targetZone] = [];
                newLayout[targetZone] = [...newLayout[targetZone], blockId];
            }

            return { ...prev, layout_config: newLayout };
        });
    };

    const moveBlock = (blockId, zoneId, direction) => {
        setData(prev => {
            const newLayout = { ...prev.layout_config };
            const arr = [...newLayout[zoneId]];
            const idx = arr.indexOf(blockId);
            if (idx === -1) return prev;
            
            if (direction === 'up' && idx > 0) {
                [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
            } else if (direction === 'down' && idx < arr.length - 1) {
                [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
            }
            
            newLayout[zoneId] = arr;
            return { ...prev, layout_config: newLayout };
        });
    };

    const updateBlockStyle = (property, value) => {
        if (!selectedBlock) return;
        
        setData(prev => {
            const newStyles = { ...prev.block_styles };
            if (!newStyles[selectedBlock]) newStyles[selectedBlock] = {};
            newStyles[selectedBlock] = { ...newStyles[selectedBlock], [property]: value };
            return { ...prev, block_styles: newStyles };
        });
    };

    const getUnusedBlocks = () => {
        const usedBlocks = Object.values(data.layout_config).flat();
        return Object.keys(AVAILABLE_BLOCKS).filter(id => !usedBlocks.includes(id));
    };

    const DroppableZone = ({ zoneId, title, className = "", alignment = "left" }) => {
        const blocks = data.layout_config[zoneId] || [];
        
        return (
            <div 
                className={`min-h-[100px] border-2 border-dashed border-gray-200/50 hover:border-gray-300 transition-colors p-2 flex flex-col gap-4 ${className} ${alignment === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, zoneId)}
            >
                {blocks.map(blockId => (
                    <div 
                        key={blockId}
                        draggable
                        onDragStart={e => handleDragStart(e, blockId, zoneId)}
                        onClick={(e) => { e.stopPropagation(); setSelectedBlock(blockId); }}
                        className={`w-full relative group cursor-move border-2 p-2 -m-2 rounded transition-all ${selectedBlock === blockId ? 'border-blue-500 shadow-sm bg-blue-50/10' : 'border-transparent hover:border-dashed hover:border-blue-300'}`}
                    >
                        <BlockPreview blockId={blockId} data={{...data, companyLogoUrl: companySettings?.logo_url}} currencyPrefix={currencyPrefix} />
                        
                        <div className="absolute -top-3 -right-3 hidden group-hover:flex bg-white shadow-md rounded border border-gray-200 z-10 overflow-hidden">
                            <div className="px-2 py-1 text-[10px] font-bold text-gray-500 border-r border-gray-200 bg-gray-50">{AVAILABLE_BLOCKS[blockId]}</div>
                            <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); moveBlock(blockId, zoneId, 'up'); }}
                                className="px-1.5 py-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 border-r border-gray-200"
                                title="Move Up"
                            >
                                <span className="material-icons text-[12px]">arrow_upward</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); moveBlock(blockId, zoneId, 'down'); }}
                                className="px-1.5 py-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 border-r border-gray-200"
                                title="Move Down"
                            >
                                <span className="material-icons text-[12px]">arrow_downward</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const ev = { dataTransfer: { getData: (k) => k === 'blockId' ? blockId : zoneId }, preventDefault: () => {} };
                                    handleDrop(ev, 'available');
                                    if (selectedBlock === blockId) setSelectedBlock(null);
                                }}
                                className="px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 text-[10px]"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                {blocks.length === 0 && (
                    <div className="w-full h-full min-h-[60px] flex items-center justify-center">
                        <span className="text-xs text-gray-300 font-medium">Drag {title} Here</span>
                    </div>
                )}
            </div>
        );
    };

    // Calculate canvas padding based on page setup
    const canvasPaddingTop = data.page_setup.margin_top ? `${Math.max(10, data.page_setup.margin_top)}px` : '40px';
    const canvasPaddingBottom = data.page_setup.margin_bottom ? `${Math.max(10, data.page_setup.margin_bottom)}px` : '40px';
    const canvasPaddingLeft = data.page_setup.margin_left ? `${Math.max(10, data.page_setup.margin_left)}px` : '40px';
    const canvasPaddingRight = data.page_setup.margin_right ? `${Math.max(10, data.page_setup.margin_right)}px` : '40px';

    // Calculate canvas dynamic max width based on page size
    const getCanvasMaxWidth = () => {
        switch (data.page_setup.size) {
            case 'A5': return '565px';
            case 'Letter': return '816px';
            case 'A4':
            default: return '800px';
        }
    };

    return (
        <form onSubmit={submit} className="space-y-1">
            <SettingsSection
                title="WYSIWYG Layout Editor"
                isEditing={true}
                onEditClick={() => {}}
                fullWidth={true}
            >
                <div className="space-y-6" onClick={() => setSelectedBlock(null)}>
                    {/* Document Selector */}
                    <div className="flex items-center gap-4 bg-white p-4 rounded border border-gray-200 shadow-sm">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Editing Layout For:</span>
                        <select
                            value={selectedDocType}
                            onChange={e => setSelectedDocType(e.target.value)}
                            className="border border-gray-300 rounded p-1.5 text-xs font-semibold bg-gray-50 text-primary-600 focus:ring-0 focus:border-primary-500"
                        >
                            {docTypes.map(doc => (
                                <option key={doc.value} value={doc.value}>{doc.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded border border-gray-200">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Custom Title</label>
                            <input
                                type="text"
                                value={data.custom_title}
                                onChange={e => setData('custom_title', e.target.value)}
                                placeholder="e.g. Tax Invoice"
                                className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white"
                            />
                        </div>

                        <div className="space-y-1.5 col-span-2">
                            <label className="block text-xs font-bold text-gray-700">Page Settings</label>
                            <div className="flex gap-2 mb-1">
                                <select 
                                    value={data.page_setup.size || 'A4'} 
                                    onChange={e => setData('page_setup', { ...data.page_setup, size: e.target.value })}
                                    className="w-32 border border-gray-300 rounded p-1 text-[10px]"
                                >
                                    <option value="A4">A4 Size</option>
                                    <option value="A5">A5 Size</option>
                                    <option value="Letter">US Letter</option>
                                </select>

                                <input
                                    type="color"
                                    title="Invoice Background Color"
                                    value={data.page_setup.background_color || '#ffffff'}
                                    onChange={e => setData('page_setup', { ...data.page_setup, background_color: e.target.value })}
                                    className="w-8 border-0 p-0 rounded cursor-pointer shrink-0"
                                />
                                <div className="flex-1 relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (e) => setData('page_setup', { ...data.page_setup, background_image: e.target.result });
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        title="Upload Background Image"
                                    />
                                    <div className="border border-gray-300 rounded p-1 text-[10px] bg-white flex items-center justify-center truncate h-full">
                                        {data.page_setup.background_image ? 'Image Selected (Click to change)' : 'Upload Background Image'}
                                    </div>
                                    {data.page_setup.background_image && (
                                        <button 
                                            type="button" 
                                            onClick={() => setData('page_setup', { ...data.page_setup, background_image: '' })}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                                <input type="number" title="Top Margin" placeholder="T" value={data.page_setup.margin_top} onChange={e => setData('page_setup', { ...data.page_setup, margin_top: e.target.value })} className="w-full border border-gray-300 rounded p-1 text-[10px] text-center" />
                                <input type="number" title="Right Margin" placeholder="R" value={data.page_setup.margin_right} onChange={e => setData('page_setup', { ...data.page_setup, margin_right: e.target.value })} className="w-full border border-gray-300 rounded p-1 text-[10px] text-center" />
                                <input type="number" title="Bottom Margin" placeholder="B" value={data.page_setup.margin_bottom} onChange={e => setData('page_setup', { ...data.page_setup, margin_bottom: e.target.value })} className="w-full border border-gray-300 rounded p-1 text-[10px] text-center" />
                                <input type="number" title="Left Margin" placeholder="L" value={data.page_setup.margin_left} onChange={e => setData('page_setup', { ...data.page_setup, margin_left: e.target.value })} className="w-full border border-gray-300 rounded p-1 text-[10px] text-center" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                        <label className="block text-xs font-bold text-gray-700">Static Footer Text</label>
                        <textarea
                            value={data.static_footer_content}
                            onChange={e => setData('static_footer_content', e.target.value)}
                            placeholder="Enter terms and conditions..."
                            className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white h-[44px] min-h-[44px]"
                        />
                    </div>

                    {/* Editor Layout */}
                    <div className="flex gap-6 items-start">
                        
                        {/* Paper Canvas - Full Width */}
                        <div className="flex-1 overflow-x-auto p-4 flex justify-center">
                            <div className="border border-gray-300 shadow-xl transition-all" style={{ 
                                backgroundColor: data.page_setup.background_color || '#ffffff',
                                backgroundImage: data.page_setup.background_image ? `url(${data.page_setup.background_image})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                width: '100%', 
                                maxWidth: getCanvasMaxWidth(),
                                minHeight: '800px',
                                paddingTop: canvasPaddingTop, 
                                paddingBottom: canvasPaddingBottom, 
                                paddingLeft: canvasPaddingLeft, 
                                paddingRight: canvasPaddingRight,
                                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
                            }}>
                                
                                {/* Header Layout */}
                                <div className="flex justify-between items-start border-b pb-8 mb-8" style={{borderColor: '#e5e7eb'}}>
                                    <DroppableZone zoneId="header_left" title="Header Left" className="w-1/2 pr-4" alignment="left" />
                                    <DroppableZone zoneId="header_right" title="Header Right" className="w-1/2 pl-4" alignment="right" />
                                </div>

                                {/* Body Layout */}
                                <div className="w-full">
                                    <DroppableZone zoneId="body" title="Main Body" className="w-full" alignment="left" />
                                </div>

                                {/* Footer Layout */}
                                <div className="flex justify-between items-start pt-8 mt-4">
                                    <DroppableZone zoneId="footer_left" title="Footer Left" className="w-1/2 pr-4" alignment="left" />
                                    <DroppableZone zoneId="footer_right" title="Footer Right" className="w-1/2 pl-4 flex justify-end" alignment="right" />
                                </div>

                            </div>
                        </div>

                        {/* Sidebar / Toolbox */}
                        <div className="w-72 flex-shrink-0 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-8 space-y-4" onClick={(e) => e.stopPropagation()}>
                            {/* Style Toolbar (Visible when a block is selected) */}
                            {selectedBlock && (
                                <div className="bg-blue-50 border border-blue-200 rounded p-3 shadow-sm">
                                    <div className="flex justify-between items-center mb-3 border-b border-blue-200 pb-2">
                                        <div className="text-[10px] uppercase tracking-wider text-blue-700 font-bold">
                                            Edit: {AVAILABLE_BLOCKS[selectedBlock]}
                                        </div>
                                        <button type="button" onClick={() => setSelectedBlock(null)} className="text-gray-400 hover:text-gray-600">
                                            <span className="material-icons text-sm">close</span>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {selectedBlock === 'logo' && (
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-gray-700">Logo Max Height (px)</label>
                                                <input 
                                                    type="number" 
                                                    value={data.block_styles[selectedBlock]?.logoHeight || ''} 
                                                    onChange={e => updateBlockStyle('logoHeight', e.target.value)} 
                                                    placeholder="Default (64)"
                                                    className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white"
                                                />
                                            </div>
                                        )}

                                        {selectedBlock !== 'logo' && (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-bold text-gray-700">Text Color</label>
                                                    <input 
                                                        type="color" 
                                                        value={data.block_styles[selectedBlock]?.color || data.text_color} 
                                                        onChange={e => updateBlockStyle('color', e.target.value)} 
                                                        className="w-6 h-6 border-0 p-0 rounded cursor-pointer"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-bold text-gray-700">Font Size (px)</label>
                                                    <input 
                                                        type="number" 
                                                        value={data.block_styles[selectedBlock]?.fontSize || ''} 
                                                        onChange={e => updateBlockStyle('fontSize', e.target.value)} 
                                                        placeholder="Default"
                                                        className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white"
                                                    />
                                                </div>

                                                {selectedBlock === 'items_table' && (
                                                    <>
                                                        <div className="space-y-1.5">
                                                            <label className="block text-xs font-bold text-gray-700">Heading Size (px)</label>
                                                            <input 
                                                                type="number" 
                                                                value={data.block_styles[selectedBlock]?.headingFontSize || ''} 
                                                                onChange={e => updateBlockStyle('headingFontSize', e.target.value)} 
                                                                placeholder="Default"
                                                                className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="block text-xs font-bold text-gray-700">Row Size (px)</label>
                                                            <input 
                                                                type="number" 
                                                                value={data.block_styles[selectedBlock]?.rowFontSize || ''} 
                                                                onChange={e => updateBlockStyle('rowFontSize', e.target.value)} 
                                                                placeholder="Default"
                                                                className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white"
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                {(selectedBlock === 'bill_to' || selectedBlock === 'shipping_to') && (
                                                    <>
                                                        <div className="space-y-1.5">
                                                            <label className="block text-xs font-bold text-gray-700">Title Size (px)</label>
                                                            <input 
                                                                type="number" 
                                                                value={data.block_styles[selectedBlock]?.titleFontSize || ''} 
                                                                onChange={e => updateBlockStyle('titleFontSize', e.target.value)} 
                                                                placeholder="Default"
                                                                className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="block text-xs font-bold text-gray-700">Name Size (px)</label>
                                                            <input 
                                                                type="number" 
                                                                value={data.block_styles[selectedBlock]?.nameFontSize || ''} 
                                                                onChange={e => updateBlockStyle('nameFontSize', e.target.value)} 
                                                                placeholder="Default"
                                                                className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white"
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}

                                        <div className="flex flex-col gap-2 pt-2 border-t border-blue-200">
                                            <span className="text-[10px] uppercase font-bold text-gray-500">Text Formatting</span>
                                            <div className="flex gap-2 mb-2">
                                                <button
                                                    type="button"
                                                    title="Align Left"
                                                    onClick={() => updateBlockStyle('textAlign', 'left')}
                                                    className={`w-8 h-8 rounded border flex items-center justify-center ${data.block_styles[selectedBlock]?.textAlign === 'left' || !data.block_styles[selectedBlock]?.textAlign ? 'bg-blue-600 text-white border-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    <span className="material-icons text-sm">format_align_left</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Align Center"
                                                    onClick={() => updateBlockStyle('textAlign', 'center')}
                                                    className={`w-8 h-8 rounded border flex items-center justify-center ${data.block_styles[selectedBlock]?.textAlign === 'center' ? 'bg-blue-600 text-white border-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    <span className="material-icons text-sm">format_align_center</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Align Right"
                                                    onClick={() => updateBlockStyle('textAlign', 'right')}
                                                    className={`w-8 h-8 rounded border flex items-center justify-center ${data.block_styles[selectedBlock]?.textAlign === 'right' ? 'bg-blue-600 text-white border-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    <span className="material-icons text-sm">format_align_right</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Justify"
                                                    onClick={() => updateBlockStyle('textAlign', 'justify')}
                                                    className={`w-8 h-8 rounded border flex items-center justify-center ${data.block_styles[selectedBlock]?.textAlign === 'justify' ? 'bg-blue-600 text-white border-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    <span className="material-icons text-sm">format_align_justify</span>
                                                </button>
                                            </div>
                                            
                                            {selectedBlock !== 'logo' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateBlockStyle('bold', !data.block_styles[selectedBlock]?.bold)}
                                                        className={`w-8 h-8 rounded border flex items-center justify-center ${data.block_styles[selectedBlock]?.bold ? 'bg-blue-600 text-white border-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        <span className="font-bold">B</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateBlockStyle('italic', !data.block_styles[selectedBlock]?.italic)}
                                                        className={`w-8 h-8 rounded border flex items-center justify-center ${data.block_styles[selectedBlock]?.italic ? 'bg-blue-600 text-white border-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        <span className="italic font-serif">I</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateBlockStyle('underline', !data.block_styles[selectedBlock]?.underline)}
                                                        className={`w-8 h-8 rounded border flex items-center justify-center ${data.block_styles[selectedBlock]?.underline ? 'bg-blue-600 text-white border-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        <span className="underline">U</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div 
                                className="bg-slate-50 border border-slate-200 rounded p-3 min-h-[300px]"
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => handleDrop(e, 'available')}
                            >
                                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3 border-b border-slate-200 pb-2">
                                    Available Blocks
                                </div>
                                <div className="space-y-2">
                                    {getUnusedBlocks().map(blockId => (
                                        <div 
                                            key={blockId}
                                            draggable
                                            onDragStart={e => handleDragStart(e, blockId, 'available')}
                                            className="bg-white p-2 text-xs border border-slate-300 shadow-sm rounded cursor-move hover:border-primary-400 transition-colors flex items-center"
                                        >
                                            <span className="material-icons text-[14px] text-gray-400 mr-2">drag_indicator</span>
                                            {AVAILABLE_BLOCKS[blockId]}
                                        </div>
                                    ))}
                                    {getUnusedBlocks().length === 0 && (
                                        <div className="text-xs text-gray-400 text-center py-4">All blocks used!</div>
                                    )}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-4 leading-tight italic">
                                    Drag these blocks onto the canvas areas on the left to add them to your layout. Click on a block in the canvas to edit its text styling.
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-green-700 text-white rounded-md text-sm font-bold shadow-sm disabled:opacity-50 hover:bg-green-800 transition-colors">Save Layout</button>
                    </div>
                </div>
            </SettingsSection>
        </form>
    );
}
