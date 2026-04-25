if (typeof Dexie === 'undefined') {
    alert('خطأ: مكتبة Dexie لم يتم تحميلها. يرجى التحقق من اتصال الإنترنت وإعادة تحميل الصفحة.');
    console.error('Dexie is not defined');
    throw new Error('Dexie not loaded');
}

const db = new Dexie('PharmacyDB');
db.version(2).stores({
    meds: '++id, name, expiry, type, category, company, scientificName, origin, image, barcode, dosageForm, dosage, createdAt',
    deletedMeds: '++id, name, expiry, type, category, company, scientificName, origin, image, barcode, dosageForm, dosage, createdAt, deletedFromPage, deletedAt',
    notifications: '++id, message, date, read',
    notificationLog: '++id, medId, lastNotified, count'
});
db.version(1).stores({
    meds: '++id, name, expiry, type, category, company, scientificName, origin, image, barcode, dosageForm, dosage, createdAt',
    deletedMeds: '++id, name, expiry, type, category, scientificName, origin, image, barcode, dosageForm, dosage, createdAt',
    notifications: '++id, message, date, read',
    notificationLog: '++id, medId, lastNotified, count'
});

const MED_TYPES = { GENERAL: 'general', PHARMACY: 'pharmacy' };

const availableColors = [
    { name: 'أخضر', nameEn: 'Green', primary: '#2a9d8f', primaryDark: '#1f6e63', primaryLight: '#4cb8aa' },
    { name: 'أزرق سماوي', nameEn: 'Sky Blue', primary: '#00b4d8', primaryDark: '#0096c7', primaryLight: '#48cae4' },
    { name: 'فيروزي', nameEn: 'Teal', primary: '#008080', primaryDark: '#006666', primaryLight: '#20b2aa' },
    { name: 'بنفسجي', nameEn: 'Purple', primary: '#6c5ce7', primaryDark: '#4a3bb5', primaryLight: '#8a7ced' },
    { name: 'أزرق', nameEn: 'Blue', primary: '#2c7da0', primaryDark: '#1f5068', primaryLight: '#4a9ec4' },
    { name: 'زيتوني', nameEn: 'Olive', primary: '#6b8e23', primaryDark: '#556b2f', primaryLight: '#9acd32' }
];

const translations = {
    ar: {
        home_title: 'إدارة صيدليتي', inbox_title: 'صندوق الوارد', explore_title: 'استكشف',
        settings_title: 'الإعدادات', about_app: 'حول التطبيق', language: 'اللغة',
        dark_mode: 'الوضع المظلم', backup_restore: 'النسخ الاحتياطي والاستعادة',
        export_db: 'تصدير JSON', import_db: 'استيراد JSON', export_csv: 'تصدير CSV',
        export_pdf: 'تصدير PDF', about_text: 'Pharmacy Manager Pro\nنسخة متطورة مع دعم قاعدة بيانات متقدمة، تصدير، إشعارات، وحذف مجمع.',
        save: 'حفظ', cancel: 'إلغاء', name: 'الاسم', search_placeholder: 'بحث...',
        filter_company: 'اسم الشركة', sort_by: 'ترتيب حسب', closest_expiry: 'الأقرب انتهاء أولاً',
        farthest_expiry: 'الأبعد انتهاء أولاً', name_asc: 'اسم (أ-ي)', name_desc: 'اسم (ي-أ)',
        newest_first: 'الأحدث أولاً', type_all: 'الكل', type_pharmacy: 'صيدلية',
        batch_delete: '🗑️ حذف المحدد', batch_add_to_pharmacy: 'إضافة المحدد إلى الصيدلية',
        add_med: 'إضافة دواء', add_general_med: 'إضافة دواء', trade_name: 'الاسم التجاري *',
        scientific_name: 'الاسم العلمي', company: 'الشركة', origin: 'المنشأ', category: 'التصنيف',
        expiry_date: 'تاريخ الانتهاء *', save_med: 'حفظ', no_meds: 'لا توجد أدوية',
        total: 'إجمالي', pharmacy_count: 'صيدلية', expired: 'منتهية', expiring_30: 'تنتهي خلال 30 يوم',
        categories: 'التصنيفات', companies: 'الشركات', expiring_soon: 'القريبة',
        no_notifications: 'لا توجد إشعارات', no_categories: 'لا توجد تصنيفات',
        no_companies: 'لا توجد شركات', delete_confirm: 'تأكيد الحذف؟',
        batch_delete_confirm: n => `حذف ${n} دواء؟`, med_details: 'تفاصيل', edit_med: 'تعديل',
        delete_med: 'حذف', all_medicines: 'كل الأدوية', pharmacy_medicines: 'أدوية الصيدلية',
        therapeutic_categories: 'التصنيفات العلاجية', international_companies: 'شركات الأدوية',
        search_btn: 'بحث', company_search_btn: 'بحث', barcode_search: 'بحث بالباركود',
        scan_barcode: 'مسح باركود', companies_sort: 'ترتيب الشركات', alphabetical: 'أبجدي',
        by_med_count: 'حسب عدد الأدوية', popular: 'الأكثر شيوعاً', medicine_count: 'عدد الأدوية',
        barcode_label: 'الباركود (اختياري)', back_to_companies: 'العودة إلى الشركات',
        add_to_pharmacy: 'إضافة إلى الصيدلية', add_expiry: 'أدخل تاريخ الانتهاء للدواء الجديد',
        added_to_pharmacy: 'تمت إضافة الدواء إلى الصيدلية', select_all: 'تحديد الكل',
        deselect_all: 'إلغاء الكل', long_press_guide: 'لتحديد دواء: اضغط مطولاً على أي دواء (0.8 ثانية) ثم اسحب إصبعك لأعلى/أسفل لتحديد عدة أدوية.',
        first_visit_welcome: 'مرحباً بك في مدير الصيدلية', dosage_form: 'الشكل الدوائي',
        dosage: 'الجرعة', deleted_items: 'سلة المحذوفات', restore: 'استعادة',
        delete_permanently: 'حذف نهائي', empty_trash: 'تفريغ السلة',
        restore_confirm: 'استعادة الدواء؟', delete_permanently_confirm: 'حذف نهائي للدواء؟',
        empty_trash_confirm: 'تفريغ سلة المحذوفات بالكامل؟', expiry1: 'تاريخ الانتهاء 1',
        expiry2: 'تاريخ الانتهاء 2', expiry3: 'تاريخ الانتهاء 3',
        medicine_exists_in_pharmacy: 'هذا الدواء موجود بالفعل في أدوية الصيدلية. هل تريد إضافته بصلاحية جديدة؟',
        yes: 'نعم', no: 'لا', notification_days: 'تنبيه قبل (أيام)',
        default_expiry: 'الصلاحية الافتراضية للإضافة', one_year: 'سنة واحدة', two_years: 'سنتان',
        three_years: '3 سنوات', five_years: '5 سنوات', manual: 'يدوي (بدون تعبئة)',
        notification_set: 'تم حفظ إعدادات التنبيه', default_expiry_set: 'تم حفظ الصلاحية الافتراضية',
        add_selected_to_pharmacy: 'إضافة الأدوية المحددة إلى الصيدلية',
        please_enter_expiry: 'أدخل تاريخ الانتهاء للدواء: ', batch_add_success: 'تمت إضافة الأدوية إلى الصيدلية',
        search_history: 'سجل البحث', change_color: 'تغيير لون التطبيق'
    },
    en: {
        home_title: 'Pharmacy Manager', inbox_title: 'Inbox', explore_title: 'Explore',
        settings_title: 'Settings', about_app: 'About App', language: 'Language',
        dark_mode: 'Dark Mode', backup_restore: 'Backup & Restore', export_db: 'Export JSON',
        import_db: 'Import JSON', export_csv: 'Export CSV', export_pdf: 'Export PDF',
        about_text: 'Pharmacy Manager Pro\nAdvanced version with database support, export, notifications, and batch delete.',
        save: 'Save', cancel: 'Cancel', name: 'Name', search_placeholder: 'Search...',
        filter_company: 'Company Name', sort_by: 'Sort by', closest_expiry: 'Closest expiry',
        farthest_expiry: 'Farthest expiry', name_asc: 'Name A-Z', name_desc: 'Name Z-A',
        newest_first: 'Newest first', type_all: 'All', type_pharmacy: 'Pharmacy',
        batch_delete: '🗑️ Delete Selected', batch_add_to_pharmacy: 'Add Selected to Pharmacy',
        add_med: 'Add Medicine', add_general_med: 'Add Medicine', trade_name: 'Trade Name *',
        scientific_name: 'Scientific Name', company: 'Company', origin: 'Origin', category: 'Category',
        expiry_date: 'Expiry Date *', save_med: 'Save', no_meds: 'No medicines',
        total: 'Total', pharmacy_count: 'Pharmacy', expired: 'Expired', expiring_30: 'Expiring in 30d',
        categories: 'Categories', companies: 'Companies', expiring_soon: 'Expiring Soon',
        no_notifications: 'No notifications', no_categories: 'No categories', no_companies: 'No companies',
        delete_confirm: 'Delete?', batch_delete_confirm: n => `Delete ${n} medicine(s)?`,
        med_details: 'Details', edit_med: 'Edit', delete_med: 'Delete', all_medicines: 'All Medicines',
        pharmacy_medicines: 'Pharmacy Medicines', therapeutic_categories: 'Categories',
        international_companies: 'Companies', search_btn: 'Search', company_search_btn: 'Search',
        barcode_search: 'Search by Barcode', scan_barcode: 'Scan Barcode',
        companies_sort: 'Sort Companies', alphabetical: 'Alphabetical',
        by_med_count: 'By Medicine Count', popular: 'Popular', medicine_count: 'Medicine Count',
        barcode_label: 'Barcode (optional)', back_to_companies: 'Back to Companies',
        add_to_pharmacy: 'Add to Pharmacy', add_expiry: 'Enter expiry date for the new medicine',
        added_to_pharmacy: 'Medicine added to pharmacy', select_all: 'Select All',
        deselect_all: 'Deselect All', long_press_guide: 'To select medicine: press and hold any medicine (0.8 sec), then drag up/down to select multiple.',
        first_visit_welcome: 'Welcome to Pharmacy Manager', dosage_form: 'Dosage Form',
        dosage: 'Dosage', deleted_items: 'Deleted Items', restore: 'Restore',
        delete_permanently: 'Delete Permanently', empty_trash: 'Empty Trash',
        restore_confirm: 'Restore medicine?', delete_permanently_confirm: 'Permanently delete medicine?',
        empty_trash_confirm: 'Empty trash completely?', expiry1: 'Expiry Date 1',
        expiry2: 'Expiry Date 2', expiry3: 'Expiry Date 3',
        medicine_exists_in_pharmacy: 'This medicine already exists in pharmacy. Do you want to add it with a new expiry date?',
        yes: 'Yes', no: 'No', notification_days: 'Notify before (days)',
        default_expiry: 'Default expiry for addition', one_year: 'One year', two_years: 'Two years',
        three_years: '3 years', five_years: '5 years', manual: 'Manual (no auto-fill)',
        notification_set: 'Notification settings saved', default_expiry_set: 'Default expiry saved',
        add_selected_to_pharmacy: 'Add selected medicines to pharmacy',
        please_enter_expiry: 'Enter expiry date for medicine: ', batch_add_success: 'Medicines added to pharmacy',
        search_history: 'Search History', change_color: 'Change App Color'
    }
};

let currentLang = localStorage.getItem('appLang') || 'ar';
let currentPage = 'home';
let searchQuery = '';
let sortBy = 'expiry_asc';
let typeFilter = MED_TYPES.GENERAL;
let selectedMeds = new Set();
let chart = null;
let currentMed = null;
let isEditing = false;
let currentCompany = null;
let recentSearches = {
    all: JSON.parse(localStorage.getItem('recentSearches_all') || '[]'),
    pharmacy: JSON.parse(localStorage.getItem('recentSearches_pharmacy') || '[]'),
    companies: JSON.parse(localStorage.getItem('recentSearches_companies') || '[]'),
    expiring: JSON.parse(localStorage.getItem('recentSearches_expiring') || '[]')
};
let selectionMode = false;
let longPressTimer = null;
let touchSelectionActive = false;
let lastTouchY = 0;
let touchStartTime = 0;
let currentPageNumber = 1;
let itemsPerPage = 50;
let totalFilteredItems = 0;
let currentFilteredList = [];
let pageHistoryStack = [];
let isInEditMode = false;
let selectedCompanies = new Set();
let selectedCategories = new Set();
let batchMode = false;
let currentCompaniesSearchTerm = '';
let currentCompaniesSortType = 'alpha';
let previousSearchQuery = '';

function t(key, ...args) {
    let text = translations[currentLang][key] || key;
    if (args.length) {
        if (typeof text === 'function') text = text(...args);
        else text = text.replace(/\{(\d+)\}/g, (_, i) => args[parseInt(i)]);
    }
    return text;
}

function showLoading(msg = 'جاري التحميل...') {
    const txt = document.getElementById('loadingText');
    if (txt) txt.innerText = msg;
    const ov = document.getElementById('loadingOverlay');
    if (ov) ov.style.display = 'flex';
    if (window._loadTimeout) clearTimeout(window._loadTimeout);
    window._loadTimeout = setTimeout(() => hideLoading(), 5000);
}
function hideLoading() {
    if (window._loadTimeout) clearTimeout(window._loadTimeout);
    const ov = document.getElementById('loadingOverlay');
    if (ov) ov.style.display = 'none';
}

function openModal(id) { const m = document.getElementById(id); if (m) m.style.display = 'flex'; }
function closeModal(id) { const m = document.getElementById(id); if (m) m.style.display = 'none'; }

function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }

function getDaysRemaining(expiryDateStr) {
    const today = new Date(); today.setHours(0,0,0,0);
    const expiry = new Date(expiryDateStr); expiry.setHours(0,0,0,0);
    return Math.ceil((expiry - today) / (1000*60*60*24));
}

function applyAppColor(color) {
    const root = document.documentElement;
    root.style.setProperty('--primary', color.primary);
    root.style.setProperty('--primary-dark', color.primaryDark);
    root.style.setProperty('--primary-light', color.primaryLight);
    if (document.body.classList.contains('dark')) {
        root.style.setProperty('--primary', color.primaryDark);
        root.style.setProperty('--primary-dark', color.primary);
    }
    const metaTheme = document.getElementById('themeColorMeta');
    if (metaTheme) metaTheme.setAttribute('content', color.primary);
    localStorage.setItem('appColor', JSON.stringify(color));
    if (currentPage === 'home' && chart) {
        updateBarChart();
    }
}
function loadSavedColor() {
    const saved = localStorage.getItem('appColor');
    if (saved) {
        try {
            const color = JSON.parse(saved);
            applyAppColor(color);
        } catch(e) { console.error(e); }
    }
}
function showColorModal() {
    const modal = document.getElementById('colorModal');
    const optionsDiv = document.getElementById('colorOptions');
    if (!optionsDiv) return;
    optionsDiv.innerHTML = '';
    availableColors.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'color-option';
        const colorName = currentLang === 'ar' ? color.name : color.nameEn;
        btn.innerHTML = `<span class="color-preview" style="background: ${color.primary};"></span> ${colorName}`;
        btn.addEventListener('click', () => {
            if (confirm(currentLang === 'ar' ? `تغيير لون التطبيق إلى ${colorName}؟` : `Change app color to ${colorName}?`)) {
                applyAppColor(color);
                closeModal('colorModal');
            }
        });
        optionsDiv.appendChild(btn);
    });
    openModal('colorModal');
}

function detectIOSDevice() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
        setTimeout(() => {
            const toast = document.createElement('div');
            toast.className = 'ios-toast-message';
            toast.innerHTML = '🍏 لتجربة أفضل على أجهزة Apple، قم بإضافة التطبيق إلى الشاشة الرئيسية';
            toast.style.cssText = 'position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:var(--primary); color:white; padding:10px 20px; border-radius:50px; font-size:12px; z-index:1000; box-shadow:0 4px 12px rgba(0,0,0,0.2); white-space:nowrap;';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 5000);
        }, 1000);
    }
}

function testDeviceCompatibility() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    
    console.log(`الجهاز: ${isIOS ? 'iOS' : isAndroid ? 'Android' : 'أخرى'}`);
    
    const features = {
        'IndexedDB': !!window.indexedDB,
        'Service Worker': 'serviceWorker' in navigator,
        'BarcodeDetector': 'BarcodeDetector' in window,
        'Notification': 'Notification' in window,
        'Camera': !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    };
    
    console.log('ميزات مدعومة:', features);
    
    if (!features.BarcodeDetector && isIOS) {
        console.warn('BarcodeDetector غير مدعوم على هذا الإصدار من iOS، سيتم استخدام ZXing كبديل');
    }
}

async function migrateData() {
    const meds = await db.meds.toArray();
    for (let med of meds) {
        let changed = false;
        if (!med.createdAt) { med.createdAt = new Date().toISOString(); changed = true; }
        if (!med.type) { med.type = MED_TYPES.GENERAL; changed = true; }
        if (changed) await db.meds.update(med.id, { createdAt: med.createdAt, type: med.type });
    }
    const deleted = await db.deletedMeds.toArray();
    for (let med of deleted) {
        let changed = false;
        if (!med.createdAt) { med.createdAt = new Date().toISOString(); changed = true; }
        if (!med.type) { med.type = MED_TYPES.GENERAL; changed = true; }
        if (changed) await db.deletedMeds.update(med.id, { createdAt: med.createdAt, type: med.type });
    }
}

async function removeDuplicateMedicines() {
    const allMeds = await db.meds.toArray();
    const uniqueMap = new Map();
    const duplicatesToDelete = [];
    
    for (const med of allMeds) {
        const key = `${med.name}|${med.scientificName || ''}|${med.company || ''}|${med.dosageForm || ''}|${med.dosage || ''}`;
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, med);
        } else {
            duplicatesToDelete.push(med.id);
        }
    }
    
    for (const id of duplicatesToDelete) {
        await db.meds.delete(id);
    }
    
    if (duplicatesToDelete.length > 0) {
        console.log(`تم حذف ${duplicatesToDelete.length} دواء مكرر`);
        if (currentPage === 'all') renderAllMedicines();
        else if (currentPage === 'pharmacy') renderPharmacyMedicines();
    }
}

async function initDemoData() {
    try {
        const count = await db.meds.count();
        if (count === 0) {
            const now = new Date();
            const generalMeds = [
                { name: "GENTAGUT DROP", scientificName: "Gentamicin sulfate", company: "Billim", origin: "Turkey", type: MED_TYPES.GENERAL, category: "مضادات حيوية", expiry: "9999-12-31", barcode: "6294015001234", dosageForm: "قطرة", dosage: "0.3%", createdAt: new Date(now - 10*86400000).toISOString() },
                { name: "Paracetamol 500mg", company: "DemoPharma", origin: "Iraq", type: MED_TYPES.GENERAL, category: "مسكنات", expiry: "9999-12-31", barcode: "6294015005678", dosageForm: "أقراص", dosage: "500mg", createdAt: new Date(now - 5*86400000).toISOString() },
                { name: "Ibuprofen 400mg", company: "DemoPharma", origin: "Iraq", type: MED_TYPES.GENERAL, category: "مسكنات", expiry: "9999-12-31", dosageForm: "أقراص", dosage: "400mg", createdAt: new Date(now - 3*86400000).toISOString() }
            ];
            const pharmacyMeds = [
                { name: "Aspirin 100mg", company: "Bayer", origin: "Germany", type: MED_TYPES.PHARMACY, category: "مسكنات", expiry: new Date(Date.now() + 10*86400000).toISOString().split('T')[0], dosageForm: "أقراص", dosage: "100mg", createdAt: new Date(now - 12*86400000).toISOString() }
            ];
            await db.meds.bulkAdd([...generalMeds, ...pharmacyMeds]);
        }
        await migrateData();
        await removeDuplicateMedicines();
    } catch (err) { console.error(err); } finally { hideLoading(); }
}

async function isDuplicateMedicine(medData, excludeId = null) {
    try {
        let query = db.meds.where('name').equals(medData.name);
        const existingMeds = await query.toArray();
        
        for (let existing of existingMeds) {
            if (excludeId && existing.id === excludeId) continue;
            
            const isDuplicate = (
                existing.name === medData.name &&
                (existing.scientificName || '') === (medData.scientificName || '') &&
                (existing.company || '') === (medData.company || '') &&
                (existing.origin || '') === (medData.origin || '') &&
                (existing.type || '') === (medData.type || '') &&
                (existing.category || '') === (medData.category || '') &&
                (existing.dosageForm || '') === (medData.dosageForm || '') &&
                (existing.dosage || '') === (medData.dosage || '') &&
                (existing.barcode || '') === (medData.barcode || '') &&
                (existing.expiry || '') === (medData.expiry || '')
            );
            
            if (isDuplicate) {
                return existing;
            }
        }
        return null;
    } catch (err) {
        console.error('Error checking duplicate:', err);
        return null;
    }
}

async function addMedicineToGeneralIfNotExists(medData) {
    try {
        const existingGeneral = await db.meds.where('type').equals(MED_TYPES.GENERAL)
            .and(m => m.name === medData.name && 
                      (m.scientificName || '') === (medData.scientificName || '') &&
                      (m.company || '') === (medData.company || '') &&
                      (m.dosageForm || '') === (medData.dosageForm || '') &&
                      (m.dosage || '') === (medData.dosage || ''))
            .first();
            
        if (!existingGeneral) {
            const generalMed = {
                name: medData.name,
                scientificName: medData.scientificName || '',
                company: medData.company || '',
                origin: medData.origin || '',
                type: MED_TYPES.GENERAL,
                category: medData.category || '',
                dosageForm: medData.dosageForm || '',
                dosage: medData.dosage || '',
                barcode: medData.barcode || '',
                image: medData.image || null,
                expiry: '9999-12-31',
                createdAt: new Date().toISOString()
            };
            
            const duplicateGeneral = await isDuplicateMedicine(generalMed);
            if (!duplicateGeneral) {
                await db.meds.add(generalMed);
            }
        }
    } catch (err) {
        console.error('Error adding to general medicines:', err);
    }
}

function goHome() {
    if (currentPage === 'home') showExitConfirmation();
    else {
        if (searchQuery !== '') {
            searchQuery = '';
        }
        switchPage('home');
    }
}

function showExitConfirmation() { openModal('exitConfirmModal'); }
function hideExitConfirmation() { closeModal('exitConfirmModal'); }
function exitApp() { if (confirm('هل تريد إغلاق التطبيق؟')) window.close(); hideExitConfirmation(); }

function showSaveChangesModal(onSave, onDiscard) {
    const modal = document.getElementById('saveChangesModal');
    if (!modal) return;
    modal.style.display = 'flex';
    const saveBtn = document.getElementById('saveAndExitBtn');
    const discardBtn = document.getElementById('exitWithoutSaveBtn');
    const cancelBtn = document.getElementById('cancelSaveExitBtn');
    if (!saveBtn || !discardBtn || !cancelBtn) return;
    const newSave = saveBtn.cloneNode(true);
    const newDiscard = discardBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSave, saveBtn);
    discardBtn.parentNode.replaceChild(newDiscard, discardBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    const handleSave = () => { modal.style.display = 'none'; if (typeof onSave === 'function') onSave(); cleanup(); };
    const handleDiscard = () => { modal.style.display = 'none'; if (typeof onDiscard === 'function') onDiscard(); cleanup(); };
    const handleCancel = () => { modal.style.display = 'none'; cleanup(); };
    const cleanup = () => {
        newSave.removeEventListener('click', handleSave);
        newDiscard.removeEventListener('click', handleDiscard);
        newCancel.removeEventListener('click', handleCancel);
    };
    newSave.addEventListener('click', handleSave);
    newDiscard.addEventListener('click', handleDiscard);
    newCancel.addEventListener('click', handleCancel);
}

function pushPageToHistory(page) {
    if (pageHistoryStack.length === 0 || pageHistoryStack[pageHistoryStack.length-1] !== page)
        pageHistoryStack.push(page);
    if (pageHistoryStack.length > 10) pageHistoryStack.shift();
}

function switchPage(page) {
    pushPageToHistory(currentPage);
    currentPage = page;
    updateAllText();
}

function updateAllText() {
    let titleKey = '';
    if (currentPage === 'home') titleKey = 'home_title';
    else if (currentPage === 'all') titleKey = 'all_medicines';
    else if (currentPage === 'pharmacy') titleKey = 'pharmacy_medicines';
    else if (currentPage === 'categories') titleKey = 'therapeutic_categories';
    else if (currentPage === 'companies') titleKey = 'international_companies';
    else if (currentPage === 'expiring') titleKey = 'expiring_soon';
    else if (currentPage === 'inbox') titleKey = 'inbox_title';
    else if (currentPage === 'explore') titleKey = 'explore_title';
    else if (currentPage === 'deleted') titleKey = 'deleted_items';
    const titleDiv = document.getElementById('appTitle');
    if (titleDiv) titleDiv.innerHTML = t(titleKey);
    
    const settingsBtn = document.getElementById('settingsHeaderBtn');
    const notifBtn = document.getElementById('notifBtn');
    const headerBackBtn = document.getElementById('headerBackBtn');
    
    if (currentPage === 'home') {
        if (headerBackBtn) headerBackBtn.style.display = 'none';
        if (settingsBtn) settingsBtn.style.display = 'flex';
        if (notifBtn) notifBtn.style.display = 'flex';
    } else {
        if (headerBackBtn) headerBackBtn.style.display = 'flex';
        if (settingsBtn) settingsBtn.style.display = 'none';
        if (notifBtn) notifBtn.style.display = 'none';
    }
    
    if (currentPage === 'home') renderHome();
    else if (currentPage === 'all') renderAllMedicines();
    else if (currentPage === 'pharmacy') renderPharmacyMedicines();
    else if (currentPage === 'categories') renderCategoriesPage();
    else if (currentPage === 'companies') renderCompaniesPage();
    else if (currentPage === 'expiring') renderExpiringSoonPage();
    else if (currentPage === 'inbox') renderInbox();
    else if (currentPage === 'explore') renderExplore();
    else if (currentPage === 'deleted') renderDeletedItems();
}

function saveSearchQuery(pageKey, query) {
    if (!query.trim()) return;
    let arr = recentSearches[pageKey];
    arr = [query, ...arr.filter(s => s !== query)].slice(0,5);
    recentSearches[pageKey] = arr;
    localStorage.setItem(`recentSearches_${pageKey}`, JSON.stringify(arr));
}

function performSearch(query, pageKey) {
    previousSearchQuery = searchQuery;
    searchQuery = query;
    saveSearchQuery(pageKey, query);
    currentPageNumber = 1;
    if (pageKey === 'all') renderAllMedicines();
    else if (pageKey === 'pharmacy') renderPharmacyMedicines();
    else if (pageKey === 'companies') renderCompaniesPage();
    else if (pageKey === 'expiring') renderExpiringSoonPage();
}

function clearSearch() {
    if (searchQuery && searchQuery.trim() !== '') {
        searchQuery = '';
        currentPageNumber = 1;
        if (currentPage === 'all') renderAllMedicines();
        else if (currentPage === 'pharmacy') renderPharmacyMedicines();
        else if (currentPage === 'companies') renderCompaniesPage();
        else if (currentPage === 'expiring') renderExpiringSoonPage();
        return true;
    }
    return false;
}

async function updateSearchSuggestions(input, suggestionsBox, type = 'medicines') {
    const query = input.value.trim().toLowerCase();
    if (!query) { suggestionsBox.classList.remove('show'); return; }
    let matches = [];
    if (type === 'medicines') {
        const allMeds = await db.meds.toArray();
        matches = allMeds.filter(med => med.name.toLowerCase().startsWith(query)).map(med => med.name).slice(0,10);
    } else if (type === 'companies') {
        const allMeds = await db.meds.toArray();
        const compSet = new Set();
        allMeds.forEach(med => { if (med.company && med.company.toLowerCase().startsWith(query)) compSet.add(med.company); });
        matches = Array.from(compSet).slice(0,10);
    }
    if (!matches.length) { suggestionsBox.classList.remove('show'); return; }
    suggestionsBox.innerHTML = matches.map(name => `<div class="suggestion-item">${escapeHtml(name)}</div>`).join('');
    suggestionsBox.classList.add('show');
    suggestionsBox.querySelectorAll('.suggestion-item').forEach(el => {
        el.addEventListener('click', () => {
            input.value = el.innerText;
            suggestionsBox.classList.remove('show');
            if (type === 'medicines') performSearch(input.value, 'all');
            else if (type === 'companies') filterCompanies(input.value);
        });
    });
}

function enhanceSearchInput(input, pageKey) {
    if (!input || input.hasAttribute('data-enhanced')) return;
    input.setAttribute('data-enhanced', 'true');
    const wrapper = input.parentElement;
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'suggestions-list';
    wrapper.style.position = 'relative';
    wrapper.appendChild(suggestionsDiv);
    input.addEventListener('input', () => updateSearchSuggestions(input, suggestionsDiv, pageKey === 'companies' ? 'companies' : 'medicines'));
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') { const q = input.value.trim(); if (q) performSearch(q, pageKey); suggestionsDiv.classList.remove('show'); } });
    input.addEventListener('blur', () => setTimeout(() => suggestionsDiv.classList.remove('show'), 200));
    const searchBtn = wrapper.querySelector('button');
    if (searchBtn && !searchBtn._bound) {
        searchBtn._bound = true;
        searchBtn.addEventListener('click', () => { const q = input.value.trim(); if (q) performSearch(q, pageKey); suggestionsDiv.classList.remove('show'); });
    }
}

function renderMedications(list, showDeleteButton = true) {
    const container = document.getElementById('contentList');
    if (!container) return;
    container.innerHTML = '';
    if (!list.length) { container.innerHTML = `<div class="empty-state">${t('no_meds')}</div>`; return; }
    list.forEach(med => {
        const thumb = med.image ? `<img src="${med.image}" class="med-image-thumb">` : '<div class="med-image-thumb">💊</div>';
        const isSelected = selectedMeds.has(med.id);
        const card = document.createElement('div');
        card.className = `med-card ${isSelected ? 'selected' : ''} ${selectionMode ? 'selection-mode' : ''}`;
        card.setAttribute('data-id', med.id);
        
        let expiryHtml = '';
        if (med.type === MED_TYPES.PHARMACY && med.expiry && med.expiry !== '9999-12-31') {
            expiryHtml = `<div class="med-expiry">📅 ${med.expiry}</div>`;
        }
        
        card.innerHTML = `<div class="med-info"><div class="checkbox"></div>${thumb}<div class="med-text"><div class="med-name">💊 ${escapeHtml(med.name)}</div>${expiryHtml}</div></div>`;
        if (showDeleteButton) {
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-button';
            delBtn.innerHTML = `<div class="trash-bin-icon"><div class="bin-lid"></div><div class="bin-container"><div class="bin-line"></div><div class="bin-line"></div></div></div>`;
            delBtn.addEventListener('click', (e) => { e.stopPropagation(); if (confirm(t('delete_confirm'))) moveToDeleted(med.id, currentPage); });
            card.appendChild(delBtn);
        }
        card.addEventListener('click', (e) => { if (selectionMode) { e.stopPropagation(); toggleSelectMed(med.id); } else showMedDetails(med); });
        card.addEventListener('touchstart', (e) => handleTouchStart(e, med.id, card));
        card.addEventListener('touchmove', handleTouchMove);
        card.addEventListener('touchend', (e) => handleTouchEnd(e, med.id, card));
        container.appendChild(card);
    });
    updateBatchDeleteButton();
    updateSelectionButtons();
}

async function renderMedicationsWithPagination(list, showDeleteButton = true) {
    currentFilteredList = list;
    totalFilteredItems = list.length;
    const start = (currentPageNumber-1)*itemsPerPage;
    const pageItems = list.slice(start, start+itemsPerPage);
    renderMedications(pageItems, showDeleteButton);
    renderPaginationControls();
}

function renderPaginationControls() {
    const container = document.getElementById('contentList');
    if (!container) return;
    const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
    let pagDiv = document.getElementById('paginationControls');
    if (!pagDiv) { pagDiv = document.createElement('div'); pagDiv.id = 'paginationControls'; pagDiv.className = 'pagination'; container.parentNode.insertBefore(pagDiv, container.nextSibling); }
    if (totalPages <= 1) { pagDiv.style.display = 'none'; return; }
    pagDiv.style.display = 'flex';
    pagDiv.innerHTML = `<button id="firstPageBtn" ${currentPageNumber===1?'disabled':''}>⏮ الأول</button><button id="prevPageBtn" ${currentPageNumber===1?'disabled':''}>◀ السابق</button><span class="page-info">الصفحة ${currentPageNumber} من ${totalPages}</span><button id="nextPageBtn" ${currentPageNumber===totalPages?'disabled':''}>التالي ▶</button><button id="lastPageBtn" ${currentPageNumber===totalPages?'disabled':''}>الأخير ⏭</button>`;
    document.getElementById('firstPageBtn')?.addEventListener('click',()=>goToPage(1));
    document.getElementById('prevPageBtn')?.addEventListener('click',()=>goToPage(currentPageNumber-1));
    document.getElementById('nextPageBtn')?.addEventListener('click',()=>goToPage(currentPageNumber+1));
    document.getElementById('lastPageBtn')?.addEventListener('click',()=>goToPage(totalPages));
}

function goToPage(page) { currentPageNumber = page; renderMedicationsWithPagination(currentFilteredList, true); window.scrollTo({top:0,behavior:'smooth'}); }
async function refreshWithPagination(list, showDeleteButton = true) { currentPageNumber = 1; await renderMedicationsWithPagination(list, showDeleteButton); }

async function moveToDeleted(medId, sourcePage = currentPage) {
    const med = await db.meds.get(medId);
    if (med) { 
        await db.deletedMeds.add({
            ...med,
            deletedFromPage: sourcePage,
            deletedAt: new Date().toISOString()
        }); 
        await db.meds.delete(medId); 
        selectedMeds.delete(medId); 
        if (sourcePage === 'all') renderAllMedicines(); 
        else if (sourcePage === 'pharmacy') renderPharmacyMedicines(); 
        else if (sourcePage === 'expiring') renderExpiringSoonPage(); 
        updateBarChart(); 
    }
}

async function restoreFromDeleted(medId, sourcePage) {
    const med = await db.deletedMeds.get(medId); 
    if(med){ 
        delete med.deletedFromPage;
        delete med.deletedAt;
        await db.meds.add(med); 
        await db.deletedMeds.delete(medId); 
        if (sourcePage === 'all') renderAllMedicines();
        else if (sourcePage === 'pharmacy') renderPharmacyMedicines();
        else renderDeletedItems();
    } 
}

async function permanentlyDelete(medId, sourcePage) { 
    if(confirm(t('delete_permanently_confirm'))){ 
        await db.deletedMeds.delete(medId); 
        renderDeletedItems();
    } 
}

async function emptyTrash(sourcePage) { 
    if(confirm(t('empty_trash_confirm'))){ 
        await db.deletedMeds.where('deletedFromPage').equals(sourcePage).delete();
        renderDeletedItems();
    } 
}

async function renderDeletedItems() {
    const currentPageSource = currentPage === 'deleted' ? 'all' : currentPage;
    let list = await db.deletedMeds.toArray();
    
    list = list.filter(item => item.deletedFromPage === currentPageSource);
    
    const container = document.getElementById('pageContent');
    container.innerHTML = `<div class="filters-bar"><button id="emptyTrashBtn" class="empty-trash-btn">🗑️ ${t('empty_trash')}</button></div><div class="content-list" id="contentList"></div>`;
    document.getElementById('emptyTrashBtn')?.addEventListener('click', () => emptyTrash(currentPageSource));
    const listDiv = document.getElementById('contentList');
    if (!list.length) { listDiv.innerHTML = `<div class="empty-state">${t('no_meds')}</div>`; return; }
    list.forEach(med => {
        const thumb = med.image ? `<img src="${med.image}" class="med-image-thumb">` : '<div class="med-image-thumb">💊</div>';
        const card = document.createElement('div'); card.className = 'med-card';
        card.innerHTML = `<div class="med-info">${thumb}<div class="med-text"><div class="med-name">💊 ${escapeHtml(med.name)}</div></div></div><div style="display:flex; gap:8px;"><button class="restore-btn small-btn" data-id="${med.id}">استعادة</button><button class="delete-permanently-btn small-btn" style="background:var(--danger);" data-id="${med.id}">حذف نهائي</button></div>`;
        card.querySelector('.restore-btn')?.addEventListener('click',(e)=>{e.stopPropagation(); restoreFromDeleted(med.id, currentPageSource);});
        card.querySelector('.delete-permanently-btn')?.addEventListener('click',(e)=>{e.stopPropagation(); permanentlyDelete(med.id, currentPageSource);});
        listDiv.appendChild(card);
    });
}

function handleTouchStart(e, id, card) {
    if (selectionMode) return;
    touchStartTime = Date.now();
    lastTouchY = e.touches[0].clientY;
    longPressTimer = setTimeout(() => {
        selectionMode = true;
        touchSelectionActive = true;
        document.querySelectorAll('.med-card .checkbox').forEach(cb => cb.style.display = 'flex');
        document.querySelectorAll('.med-card').forEach(c => c.classList.add('selection-mode'));
        toggleSelectMed(id);
        updateSelectionButtons();
    }, 800);
}
function handleTouchMove(e) { if (!touchSelectionActive) return; e.preventDefault(); const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY); const card = el?.closest('.med-card'); if (card) { const id = parseInt(card.getAttribute('data-id')); if (!selectedMeds.has(id)) toggleSelectMed(id); } }
function handleTouchEnd(e, id, card) { clearTimeout(longPressTimer); if (touchSelectionActive) touchSelectionActive = false; }
function toggleSelectMed(id) {
    if (selectedMeds.has(id)) selectedMeds.delete(id); else selectedMeds.add(id);
    const card = document.querySelector(`.med-card[data-id="${id}"]`);
    if (card) card.classList.toggle('selected', selectedMeds.has(id));
    updateBatchDeleteButton();
    updateSelectionButtons();
    if (selectedMeds.size === 0) { selectionMode = false; document.querySelectorAll('.med-card .checkbox').forEach(cb => cb.style.display = 'none'); document.querySelectorAll('.med-card').forEach(c => c.classList.remove('selection-mode')); }
}
function updateBatchDeleteButton() {
    const batchBtn = document.getElementById('batchDeleteBtn'); if(batchBtn) batchBtn.style.display = selectedMeds.size>0 ? 'inline-flex' : 'none';
    const batchAddBtn = document.getElementById('batchAddToPharmacyBtn'); if(batchAddBtn) batchAddBtn.style.display = selectedMeds.size>0 ? 'inline-flex' : 'none';
}
function updateSelectionButtons() {
    const selectAllBtn = document.getElementById('selectAllBtn'); const deselectAllBtn = document.getElementById('deselectAllBtn');
    const hasMeds = document.querySelectorAll('.med-card').length>0;
    const anySelected = selectedMeds.size>0;
    if(selectAllBtn) selectAllBtn.style.display = hasMeds && selectionMode ? 'inline-flex' : 'none';
    if(deselectAllBtn) deselectAllBtn.style.display = hasMeds && anySelected ? 'inline-flex' : 'none';
}
function selectAllMeds() { document.querySelectorAll('.med-card').forEach(card => { const id = parseInt(card.getAttribute('data-id')); if (!selectedMeds.has(id)) toggleSelectMed(id); }); }
function deselectAllMeds() { document.querySelectorAll('.med-card').forEach(card => { const id = parseInt(card.getAttribute('data-id')); if (selectedMeds.has(id)) toggleSelectMed(id); }); }

async function batchDelete() { 
    if(selectedMeds.size===0) return alert(t('batch_delete_confirm',0)); 
    if(confirm(t('batch_delete_confirm',selectedMeds.size))){ 
        showLoading('جاري حذف الأدوية...'); 
        try{ 
            for(let id of selectedMeds){ 
                const med = await db.meds.get(id); 
                if(med) await db.deletedMeds.add({
                    ...med,
                    deletedFromPage: currentPage,
                    deletedAt: new Date().toISOString()
                }); 
                await db.meds.delete(id); 
            } 
            selectedMeds.clear(); 
            selectionMode=false; 
            document.querySelectorAll('.med-card .checkbox').forEach(cb=>cb.style.display='none'); 
            if(currentPage==='all') renderAllMedicines(); 
            else if(currentPage==='pharmacy') renderPharmacyMedicines(); 
            updateBarChart(); 
        }finally{ 
            hideLoading(); 
        } 
    } 
}

async function batchAddToPharmacy() { 
    if(selectedMeds.size===0) return; 
    const medicines = []; 
    for(let id of selectedMeds){ 
        const med = await db.meds.get(id); 
        if(med) medicines.push(med); 
    } 
    if(!medicines.length) return; 
    showLoading('جاري إضافة الأدوية إلى الصيدلية...'); 
    let added=0; 
    let duplicates=0;
    for(let med of medicines){ 
        const newExpiry = prompt(t('please_enter_expiry')+med.name, new Date(Date.now()+30*86400000).toISOString().split('T')[0]); 
        if(!newExpiry) continue; 
        
        const newMed = { 
            name:med.name, expiry:newExpiry, scientificName:med.scientificName||'', company:med.company||'', 
            origin:med.origin||'', type:MED_TYPES.PHARMACY, category:med.category||'', 
            barcode:med.barcode||'', image:med.image||null, dosageForm:med.dosageForm||'', 
            dosage:med.dosage||'', createdAt:new Date().toISOString() 
        };
        
        const duplicate = await isDuplicateMedicine(newMed);
        if (duplicate) {
            duplicates++;
            continue;
        }
        
        await db.meds.add(newMed); 
        added++; 
        await addMedicineToGeneralIfNotExists(newMed); 
    } 
    hideLoading(); 
    if(added>0){ 
        const toast = document.createElement('div'); 
        toast.className='offline-toast'; 
        let msg = t('batch_add_success')+` (${added})`;
        if(duplicates>0) msg += `، تم تخطي ${duplicates} دواء مكرر`;
        toast.innerText = msg; 
        document.body.appendChild(toast); 
        setTimeout(()=>toast.remove(),3000); 
        if(currentPage==='all') renderAllMedicines(); 
        else if(currentPage==='pharmacy') renderPharmacyMedicines(); 
    } else if(duplicates>0) {
        alert(`لم يتم إضافة أي دواء. جميع الأدوية (${duplicates}) مكررة بالفعل في الصيدلية.`);
    } else {
        alert('لم يتم إضافة أي دواء');
    }
}

function openCustomSortModal(sortType, onSelectCallback) {
    const modal = document.getElementById('customSortModal');
    const optionsList = document.getElementById('sortOptionsList');
    const title = document.getElementById('sortModalTitle');
    
    if (!modal || !optionsList) return;
    
    let options = [];
    if (sortType === 'medicines') {
        title.innerText = currentLang === 'ar' ? 'ترتيب الأدوية حسب' : 'Sort Medicines By';
        options = [
            { value: 'expiry_asc', label: currentLang === 'ar' ? 'الأقرب انتهاء أولاً' : 'Closest Expiry First' },
            { value: 'expiry_desc', label: currentLang === 'ar' ? 'الأبعد انتهاء أولاً' : 'Farthest Expiry First' },
            { value: 'name_asc', label: currentLang === 'ar' ? 'الاسم (أ-ي)' : 'Name A-Z' },
            { value: 'name_desc', label: currentLang === 'ar' ? 'الاسم (ي-أ)' : 'Name Z-A' },
            { value: 'date_desc', label: currentLang === 'ar' ? 'الأحدث أولاً' : 'Newest First' }
        ];
    } else if (sortType === 'companies') {
        title.innerText = currentLang === 'ar' ? 'ترتيب الشركات حسب' : 'Sort Companies By';
        options = [
            { value: 'alpha', label: currentLang === 'ar' ? 'أبجدي' : 'Alphabetical' },
            { value: 'count_desc', label: currentLang === 'ar' ? 'عدد الأدوية (تنازلي)' : 'Medicine Count (Desc)' },
            { value: 'count_asc', label: currentLang === 'ar' ? 'عدد الأدوية (تصاعدي)' : 'Medicine Count (Asc)' },
            { value: 'popular', label: currentLang === 'ar' ? 'الأكثر شيوعاً' : 'Most Popular' }
        ];
    }
    
    optionsList.innerHTML = options.map(opt => `
        <button class="sort-option-btn" data-value="${opt.value}">${opt.label}</button>
    `).join('');
    
    optionsList.querySelectorAll('.sort-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.getAttribute('data-value');
            if (onSelectCallback) onSelectCallback(value);
            closeModal('customSortModal');
        });
    });
    
    openModal('customSortModal');
}

function renderHome() {
    const container = document.getElementById('pageContent');
    container.innerHTML = `
        <div class="dashboard-search">
            <div class="search-wrapper">
                <input type="text" id="dashboardSearch" placeholder="${t('search_placeholder')}">
                <button class="search-btn">${t('search_btn')}</button>
                <button id="homeBarcodeBtn" class="barcode-search-btn">📷 باركود</button>
            </div>
        </div>
        <div class="chart-container"><canvas id="expiryBarChart" width="400" height="200"></canvas></div>
        <div class="main-buttons">
            <button class="main-btn" data-page="all">${t('all_medicines')}</button>
            <button class="main-btn" data-page="pharmacy">${t('pharmacy_medicines')}</button>
            <button class="main-btn" data-page="categories">${t('therapeutic_categories')}</button>
            <button class="main-btn" data-page="companies">${t('international_companies')}</button>
            <button class="main-btn" data-page="expiring">${t('expiring_soon')}</button>
        </div>
        <div id="stats"></div>
    `;
    document.querySelectorAll('.main-btn').forEach(btn => btn.addEventListener('click', () => switchPage(btn.dataset.page)));
    const searchBtn = container.querySelector('.dashboard-search .search-btn');
    const searchInput = document.getElementById('dashboardSearch');
    const homeBarcode = document.getElementById('homeBarcodeBtn');
    if(homeBarcode) homeBarcode.addEventListener('click', () => window.startScannerForSearch());
    if(searchBtn && searchInput){
        searchBtn.addEventListener('click', () => { const q = searchInput.value.trim(); if(q){ searchQuery=q; saveSearchQuery('all',q); switchPage('all'); } });
        enhanceSearchInput(searchInput, 'all');
    }
    updateBarChart();
    showStats();
    showFirstTimeGuidance();
    const statsDiv = document.getElementById('stats');
    if (statsDiv && !document.getElementById('realDateTime')) {
        const dateTimeDiv = document.createElement('div');
        dateTimeDiv.id = 'realDateTime';
        dateTimeDiv.className = 'datetime-box';
        statsDiv.appendChild(dateTimeDiv);
        updateDateTime();
        setInterval(updateDateTime, 1000);
    } else if (document.getElementById('realDateTime')) {
        updateDateTime();
    }
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', month: 'long', day: 'numeric',
        weekday: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    };
    const dateTimeStr = now.toLocaleString(currentLang === 'ar' ? 'ar-IQ' : 'en-US', options);
    const dateTimeElement = document.getElementById('realDateTime');
    if (dateTimeElement) {
        dateTimeElement.innerHTML = `🕒 ${dateTimeStr}`;
    }
}

async function updateBarChart() {
    const ctx = document.getElementById('expiryBarChart')?.getContext('2d');
    if(!ctx) return;
    const meds = await db.meds.toArray();
    const expired = meds.filter(m=>getDaysRemaining(m.expiry)<0).length;
    const soon = meds.filter(m=>{let d=getDaysRemaining(m.expiry); return d>=0 && d<=30;}).length;
    const later = meds.length - expired - soon;
    if(chart) chart.destroy();
    chart = new Chart(ctx, {
        type:'bar', data:{ labels:[t('expired'), t('expiring_30'), (currentLang==='ar'?'أكثر من 30 يوم':'More than 30 days')],
        datasets:[{ label:t('total'), data:[expired,soon,later], backgroundColor:['#e76f51','#f4a261','#2a9d8f'], borderRadius:8 }] },
        options:{ responsive:true, plugins:{ legend:{ position:'top' } }, scales:{ y:{ beginAtZero:true } } }
    });
}
async function showStats() {
    const meds = await db.meds.toArray();
    const total = meds.length;
    const expired = meds.filter(m=>getDaysRemaining(m.expiry)<0).length;
    const expiring30 = meds.filter(m=>{let d=getDaysRemaining(m.expiry); return d>=0 && d<=30;}).length;
    const pharmacyCount = meds.filter(m=>m.type===MED_TYPES.PHARMACY).length;
    document.getElementById('stats').innerHTML = `<div class="stats-box"><div>${t('total')}: <strong>${total}</strong></div><div>${t('pharmacy_count')}: <strong>${pharmacyCount}</strong></div><div>${t('expired')}: <strong style="color:var(--danger)">${expired}</strong></div><div>${t('expiring_30')}: <strong style="color:var(--warning)">${expiring30}</strong></div></div>`;
}

async function getFilteredAndSorted() {
    let list = await db.meds.toArray();
    
    if(searchQuery.trim()){ 
        const q = searchQuery.toLowerCase(); 
        list = list.filter(m => m.name.toLowerCase().includes(q) || 
                              (m.scientificName && m.scientificName.toLowerCase().includes(q)) || 
                              (m.company && m.company.toLowerCase().includes(q)) || 
                              (m.barcode && m.barcode.toLowerCase().includes(q))); 
    }
    if(typeFilter !== 'all') list = list.filter(m => m.type === typeFilter);
    
    const uniqueMap = new Map();
    for (const med of list) {
        const key = `${med.name}|${med.scientificName || ''}|${med.company || ''}|${med.dosageForm || ''}|${med.dosage || ''}`;
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, med);
        }
    }
    list = Array.from(uniqueMap.values());
    
    if(sortBy === 'expiry_asc') list.sort((a,b)=>getDaysRemaining(a.expiry)-getDaysRemaining(b.expiry));
    else if(sortBy === 'expiry_desc') list.sort((a,b)=>getDaysRemaining(b.expiry)-getDaysRemaining(a.expiry));
    else if(sortBy === 'name_asc') list.sort((a,b)=>a.name.localeCompare(b.name));
    else if(sortBy === 'name_desc') list.sort((a,b)=>b.name.localeCompare(a.name));
    else if(sortBy === 'date_desc') list.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    return list;
}

async function renderAllMedicines() {
    typeFilter = MED_TYPES.GENERAL;
    const container = document.getElementById('pageContent');
    container.innerHTML = `
        <div class="search-container"><div class="search-wrapper"><input type="text" id="search" placeholder="${t('search_placeholder')}"><button class="search-btn">${t('search_btn')}</button><button id="barcodeSearchBtn" class="barcode-search-btn">📷 باركود</button></div><div id="suggestionsBox" class="suggestions-list"></div></div>
        <div class="filters-bar"><button id="customSortBtn" class="sort-select-btn">🔽 ${t('sort_by')}</button><button id="addGeneralMedBtn" class="plus-icon-btn">${t('add_med')}</button><button id="batchAddToPharmacyBtn" class="plus-icon-btn" style="display:none;">${t('batch_add_to_pharmacy')}</button><button id="batchDeleteBtn" class="batch-delete-btn" style="display:none;">🗑️ ${t('batch_delete')}</button><button id="selectAllBtn" class="select-all-btn" style="display:none;">${t('select_all')}</button><button id="deselectAllBtn" class="deselect-all-btn" style="display:none;">${t('deselect_all')}</button></div>
        <div class="content-list" id="contentList"></div><div id="stats"></div>
    `;
    const searchInput = document.getElementById('search'), searchBtn = container.querySelector('.search-btn'), suggestionsBox = document.getElementById('suggestionsBox'), barcodeBtn = document.getElementById('barcodeSearchBtn'), batchBtn = document.getElementById('batchDeleteBtn'), selectAllBtn = document.getElementById('selectAllBtn'), deselectAllBtn = document.getElementById('deselectAllBtn'), batchAddBtn = document.getElementById('batchAddToPharmacyBtn'), addGeneralBtn = document.getElementById('addGeneralMedBtn');
    
    const customSortBtn = document.getElementById('customSortBtn');
    if (customSortBtn) {
        customSortBtn.addEventListener('click', () => {
            openCustomSortModal('medicines', (value) => {
                sortBy = value;
                if (currentPage === 'all') renderAllMedicines();
                else if (currentPage === 'pharmacy') renderPharmacyMedicines();
            });
        });
    }
    
    if(batchBtn) batchBtn.addEventListener('click', batchDelete);
    if(selectAllBtn) selectAllBtn.addEventListener('click', selectAllMeds);
    if(deselectAllBtn) deselectAllBtn.addEventListener('click', deselectAllMeds);
    if(batchAddBtn) batchAddBtn.addEventListener('click', batchAddToPharmacy);
    if(addGeneralBtn) addGeneralBtn.addEventListener('click', showAddGeneralFormModal);
    if(searchBtn && searchInput) searchBtn.addEventListener('click', () => { const q = searchInput.value.trim(); if(q) performSearch(q, 'all'); suggestionsBox.classList.remove('show'); });
    if(barcodeBtn) barcodeBtn.addEventListener('click', () => window.startScannerForSearch());
    if(searchInput){ searchInput.addEventListener('input', () => updateSearchSuggestions(searchInput, suggestionsBox, 'medicines')); searchInput.addEventListener('keypress', (e) => { if(e.key==='Enter'){ const q = searchInput.value.trim(); if(q) performSearch(q, 'all'); suggestionsBox.classList.remove('show'); } }); searchInput.addEventListener('blur', () => setTimeout(()=>suggestionsBox.classList.remove('show'),200)); }
    const list = await getFilteredAndSorted();
    await refreshWithPagination(list, true);
    showStats();
}

async function renderPharmacyMedicines() {
    typeFilter = MED_TYPES.PHARMACY;
    const container = document.getElementById('pageContent');
    container.innerHTML = `
        <div class="search-container"><div class="search-wrapper"><input type="text" id="search" placeholder="${t('search_placeholder')}"><button class="search-btn">${t('search_btn')}</button><button id="barcodeSearchBtn" class="barcode-search-btn">📷 باركود</button></div><div id="suggestionsBox" class="suggestions-list"></div></div>
        <div class="filters-bar"><button id="customSortBtn" class="sort-select-btn">🔽 ${t('sort_by')}</button><button id="addMedBtn" class="plus-icon-btn">${t('add_med')}</button><button id="recycleBinBtn" class="recycle-bin-btn">سلة المحذوفات</button><button id="batchDeleteBtn" class="batch-delete-btn" style="display:none;">🗑️ ${t('batch_delete')}</button><button id="selectAllBtn" class="select-all-btn" style="display:none;">${t('select_all')}</button><button id="deselectAllBtn" class="deselect-all-btn" style="display:none;">${t('deselect_all')}</button></div>
        <div class="content-list" id="contentList"></div><div id="stats"></div>
    `;
    document.getElementById('addMedBtn')?.addEventListener('click', showAddFormModal);
    document.getElementById('recycleBinBtn')?.addEventListener('click', () => switchPage('deleted'));
    
    const searchInput = document.getElementById('search'), searchBtn = container.querySelector('.search-btn'), suggestionsBox = document.getElementById('suggestionsBox'), barcodeBtn = document.getElementById('barcodeSearchBtn'), batchBtn = document.getElementById('batchDeleteBtn'), selectAllBtn = document.getElementById('selectAllBtn'), deselectAllBtn = document.getElementById('deselectAllBtn');
    
    const customSortBtn = document.getElementById('customSortBtn');
    if (customSortBtn) {
        customSortBtn.addEventListener('click', () => {
            openCustomSortModal('medicines', (value) => {
                sortBy = value;
                if (currentPage === 'all') renderAllMedicines();
                else if (currentPage === 'pharmacy') renderPharmacyMedicines();
            });
        });
    }
    
    if(batchBtn) batchBtn.addEventListener('click', batchDelete);
    if(selectAllBtn) selectAllBtn.addEventListener('click', selectAllMeds);
    if(deselectAllBtn) deselectAllBtn.addEventListener('click', deselectAllMeds);
    if(searchBtn && searchInput) searchBtn.addEventListener('click', () => { const q = searchInput.value.trim(); if(q) performSearch(q, 'pharmacy'); suggestionsBox.classList.remove('show'); });
    if(barcodeBtn) barcodeBtn.addEventListener('click', () => window.startScannerForSearch());
    if(searchInput){ searchInput.addEventListener('input', () => updateSearchSuggestions(searchInput, suggestionsBox, 'medicines')); searchInput.addEventListener('keypress', (e) => { if(e.key==='Enter'){ const q = searchInput.value.trim(); if(q) performSearch(q, 'pharmacy'); suggestionsBox.classList.remove('show'); } }); searchInput.addEventListener('blur', () => setTimeout(()=>suggestionsBox.classList.remove('show'),200)); }
    const list = await getFilteredAndSorted();
    await refreshWithPagination(list, true);
    showStats();
}

function toggleBatchMode() {
    batchMode = !batchMode;
    if (batchMode) {
        document.querySelectorAll('.company-card, .category-card').forEach(card => {
            let cb = card.querySelector('.checkbox');
            if (!cb) { cb = document.createElement('div'); cb.className = 'checkbox'; card.appendChild(cb); }
            cb.style.display = 'flex';
            card.classList.add('batch-selectable');
        });
    } else {
        document.querySelectorAll('.company-card, .category-card').forEach(card => {
            const cb = card.querySelector('.checkbox');
            if (cb) cb.style.display = 'none';
            card.classList.remove('batch-selectable', 'selected');
        });
        selectedCompanies.clear();
        selectedCategories.clear();
    }
    const bar = document.querySelector('.batch-actions-bar');
    if (bar) bar.style.display = batchMode ? 'flex' : 'none';
}

function toggleSelectCompany(name) {
    if (selectedCompanies.has(name)) selectedCompanies.delete(name);
    else selectedCompanies.add(name);
    const card = document.querySelector(`.company-card[data-company="${escapeHtml(name)}"]`);
    if (card) card.classList.toggle('selected', selectedCompanies.has(name));
    updateBatchRenameBtnCount();
}

function toggleSelectCategory(name) {
    if (selectedCategories.has(name)) selectedCategories.delete(name);
    else selectedCategories.add(name);
    const card = document.querySelector(`.category-card[data-category="${escapeHtml(name)}"]`);
    if (card) card.classList.toggle('selected', selectedCategories.has(name));
    updateBatchRenameCategoriesCount();
}

async function batchRenameCompanies() {
    if (!selectedCompanies.size) return alert('لم يتم تحديد أي شركة');
    const newName = prompt('أدخل الاسم الجديد للشركات المحددة:');
    if (!newName?.trim()) return;
    showLoading(`جاري تغيير اسم ${selectedCompanies.size} شركة إلى "${newName}"...`);
    try {
        const companiesToRename = Array.from(selectedCompanies);
        for (let oldName of companiesToRename) {
            const medsToUpdate = await db.meds.where('company').equals(oldName).toArray();
            for (let med of medsToUpdate) {
                await db.meds.update(med.id, { company: newName });
            }
            const deletedToUpdate = await db.deletedMeds.where('company').equals(oldName).toArray();
            for (let med of deletedToUpdate) {
                await db.deletedMeds.update(med.id, { company: newName });
            }
        }
        alert(`تم تحديث ${selectedCompanies.size} شركة إلى "${newName}"`);
        selectedCompanies.clear();
        batchMode = false;
        await renderCompaniesPage();
    } catch (err) {
        console.error('خطأ في batchRenameCompanies:', err);
        alert('حدث خطأ أثناء التعديل الجماعي: ' + err.message);
    } finally {
        hideLoading();
    }
}

async function batchRenameCategories() {
    if (!selectedCategories.size) return alert('لم يتم تحديد أي تصنيف');
    const newName = prompt('أدخل الاسم الجديد للتصنيفات المحددة:');
    if (!newName?.trim()) return;
    showLoading(`جاري تغيير اسم ${selectedCategories.size} تصنيف إلى "${newName}"...`);
    try {
        const categoriesToRename = Array.from(selectedCategories);
        for (let oldName of categoriesToRename) {
            const medsToUpdate = await db.meds.where('category').equals(oldName).toArray();
            for (let med of medsToUpdate) {
                await db.meds.update(med.id, { category: newName });
            }
            const deletedToUpdate = await db.deletedMeds.where('category').equals(oldName).toArray();
            for (let med of deletedToUpdate) {
                await db.deletedMeds.update(med.id, { category: newName });
            }
        }
        alert(`تم تحديث ${selectedCategories.size} تصنيف إلى "${newName}"`);
        selectedCategories.clear();
        batchMode = false;
        await renderCategoriesPage();
    } catch (err) {
        console.error('خطأ في batchRenameCategories:', err);
        alert('حدث خطأ أثناء التعديل الجماعي: ' + err.message);
    } finally {
        hideLoading();
    }
}

async function batchDeleteCompanies() {
    if (!selectedCompanies.size) return alert('لم يتم تحديد أي شركة');
    if (!confirm(`حذف ${selectedCompanies.size} شركة وكل أدويتها؟`)) return;
    showLoading('جاري حذف الشركات...');
    try {
        for (let c of selectedCompanies) {
            const meds = await db.meds.where('company').equals(c).toArray();
            for (let m of meds) await db.deletedMeds.add({
                ...m,
                deletedFromPage: 'companies',
                deletedAt: new Date().toISOString()
            });
            await db.meds.where('company').equals(c).delete();
        }
        alert('تم الحذف');
        selectedCompanies.clear();
        batchMode = false;
        await renderCompaniesPage();
    } catch (e) { alert('خطأ'); } finally { hideLoading(); }
}

async function batchDeleteCategories() {
    if (!selectedCategories.size) return alert('لم يتم تحديد أي تصنيف');
    if (!confirm(`حذف ${selectedCategories.size} تصنيف وكل أدويته؟`)) return;
    showLoading('جاري حذف التصنيفات...');
    try {
        for (let c of selectedCategories) {
            const meds = await db.meds.where('category').equals(c).toArray();
            for (let m of meds) await db.deletedMeds.add({
                ...m,
                deletedFromPage: 'categories',
                deletedAt: new Date().toISOString()
            });
            await db.meds.where('category').equals(c).delete();
        }
        alert('تم الحذف');
        selectedCategories.clear();
        batchMode = false;
        await renderCategoriesPage();
    } catch (e) { alert('خطأ'); } finally { hideLoading(); }
}

async function renderCompaniesPage() {
    if (currentCompany) return showMedicinesByCompany(currentCompany);
    batchMode = false;
    selectedCompanies.clear();

    const meds = await db.meds.toArray();
    const companyMap = new Map();
    meds.forEach(m => {
        if (m.company && m.company.trim()) {
            if (!companyMap.has(m.company)) companyMap.set(m.company, { origin: m.origin || 'غير معروف', count: 1 });
            else companyMap.get(m.company).count++;
        }
    });
    let companies = Array.from(companyMap.entries()).map(([name, data]) => ({ name, origin: data.origin, count: data.count }));
    companies.sort((a, b) => a.name.localeCompare(b.name));

    const container = document.getElementById('pageContent');
    if (!companies.length) {
        container.innerHTML = `<div class="empty-state">${t('no_companies')}</div>`;
        return;
    }
    container.innerHTML = `
        <div class="search-container"><div class="search-wrapper"><input id="companySearch" placeholder="🔍 بحث عن شركة..."><button id="searchCompanyBtn">${t('search_btn')}</button></div><div id="suggestionsBox" class="suggestions-list"></div></div>
        <div class="companies-sort-bar" style="display:flex; gap:10px; margin:12px 0; flex-wrap:wrap;"><label>${t('companies_sort')}</label><button id="customCompaniesSortBtn" class="sort-select-btn">🔽 ${t('sort_by')}</button><button id="addCompanyBtn" class="main-btn">إضافة شركة جديدة</button><button id="batchModeBtn" class="main-btn" style="background:var(--warning)">تحديد متعدد</button><button id="selectAllCompaniesBtn" class="main-btn" style="background:var(--success); display:none;">تحديد الكل</button></div>
        <div id="batchActionsBar" class="batch-actions-bar" style="display:none;"><button id="batchRenameBtn" class="batch-rename-btn">تعديل جماعي (0)</button><button id="batchDeleteCompaniesBtn" class="batch-delete-entity-btn">🗑️ حذف جماعي</button><button id="batchCancelBtn" class="batch-cancel-btn">إلغاء التحديد</button></div>
        <div id="companiesList"></div>
    `;

    const searchInput = document.getElementById('companySearch');
    const searchBtn = document.getElementById('searchCompanyBtn');
    const suggestionsBox = document.getElementById('suggestionsBox');
    const addBtn = document.getElementById('addCompanyBtn');
    const batchModeBtn = document.getElementById('batchModeBtn');
    const selectAllCompaniesBtn = document.getElementById('selectAllCompaniesBtn');
    const batchBar = document.getElementById('batchActionsBar');
    const renameBtn = document.getElementById('batchRenameBtn');
    const deleteBtn = document.getElementById('batchDeleteCompaniesBtn');
    const cancelBtn = document.getElementById('batchCancelBtn');
    const customCompaniesSortBtn = document.getElementById('customCompaniesSortBtn');

    if (searchInput) searchInput.value = currentCompaniesSearchTerm;

    if (customCompaniesSortBtn) {
        customCompaniesSortBtn.addEventListener('click', () => {
            openCustomSortModal('companies', (value) => {
                currentCompaniesSortType = value;
                const term = searchInput?.value || '';
                displayCompanies(term, value);
            });
        });
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const q = searchInput.value.trim();
            if (q) {
                saveSearchQuery('companies', q);
                filterCompanies(q);
            }
            suggestionsBox.classList.remove('show');
        });
    }
    if (searchInput) {
        searchInput.addEventListener('input', () => updateSearchSuggestions(searchInput, suggestionsBox, 'companies'));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const q = searchInput.value.trim();
                if (q) {
                    saveSearchQuery('companies', q);
                    filterCompanies(q);
                }
                suggestionsBox.classList.remove('show');
            }
        });
        searchInput.addEventListener('blur', () => setTimeout(() => suggestionsBox.classList.remove('show'), 200));
    }
    if (addBtn) addBtn.addEventListener('click', () => window.addNewCompany());
    if (batchModeBtn) {
        batchModeBtn.addEventListener('click', () => {
            batchMode = !batchMode;
            if (batchMode) {
                batchBar.style.display = 'flex';
                if (selectAllCompaniesBtn) selectAllCompaniesBtn.style.display = 'inline-flex';
                batchModeBtn.style.background = 'var(--success)';
                batchModeBtn.innerText = 'إلغاء التحديد';
                renderCompaniesInBatchMode();
            } else {
                batchBar.style.display = 'none';
                if (selectAllCompaniesBtn) selectAllCompaniesBtn.style.display = 'none';
                batchModeBtn.style.background = 'var(--warning)';
                batchModeBtn.innerText = 'تحديد متعدد';
                selectedCompanies.clear();
                renderCompaniesPage();
            }
        });
    }
    if (selectAllCompaniesBtn) {
        selectAllCompaniesBtn.addEventListener('click', () => {
            const currentCompanies = Array.from(document.querySelectorAll('#companiesList .company-card')).map(card => card.getAttribute('data-company'));
            for (let company of currentCompanies) {
                if (!selectedCompanies.has(company)) {
                    toggleSelectCompany(company);
                }
            }
            updateBatchRenameBtnCount();
        });
    }
    if (renameBtn) renameBtn.addEventListener('click', batchRenameCompanies);
    if (deleteBtn) deleteBtn.addEventListener('click', batchDeleteCompanies);
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        selectedCompanies.clear();
        renameBtn.innerText = 'تعديل جماعي (0)';
        renderCompaniesPage();
    });

    await displayCompanies(currentCompaniesSearchTerm, currentCompaniesSortType);
}

async function renderCompaniesInBatchMode() {
    const meds = await db.meds.toArray();
    const map = new Map();
    meds.forEach(m => {
        if (m.company) map.set(m.company, { origin: m.origin || 'غير معروف', count: (map.get(m.company)?.count || 0) + 1 });
    });
    let companies = Array.from(map.entries()).map(([n, d]) => ({ name: n, origin: d.origin, count: d.count }));

    if (currentCompaniesSearchTerm.trim()) {
        companies = companies.filter(c => c.name.toLowerCase().includes(currentCompaniesSearchTerm.toLowerCase()));
    }
    if (currentCompaniesSortType === 'alpha') companies.sort((a, b) => a.name.localeCompare(b.name));
    else if (currentCompaniesSortType === 'count_desc') companies.sort((a, b) => b.count - a.count);
    else if (currentCompaniesSortType === 'count_asc') companies.sort((a, b) => a.count - b.count);
    else if (currentCompaniesSortType === 'popular') companies.sort((a, b) => b.count - a.count);

    const container = document.getElementById('companiesList');
    container.innerHTML = `<div class="companies-grid">${companies.map(c => `
        <div class="company-card ${selectedCompanies.has(c.name) ? 'selected' : ''}" data-company="${escapeHtml(c.name)}">
            <div>🏭 ${escapeHtml(c.name)}</div>
            <div class="company-origin">📍 ${escapeHtml(c.origin)}</div>
            <div class="medicine-count">📊 ${t('medicine_count')}: ${c.count}</div>
            <div class="checkbox" style="display:flex;"></div>
            <button class="delete-entity-btn" data-delete="${escapeHtml(c.name)}">🗑️ حذف</button>
        </div>`).join('')}</div>`;

    document.querySelectorAll('.company-card').forEach(card => {
        const comp = card.getAttribute('data-company');
        const del = card.querySelector('.delete-entity-btn');
        if (del) {
            del.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`حذف الشركة "${comp}" وجميع أدويتها؟`)) {
                    showLoading();
                    try {
                        const medsToDelete = await db.meds.where('company').equals(comp).toArray();
                        for (let m of medsToDelete) await db.deletedMeds.add({
                            ...m,
                            deletedFromPage: 'companies',
                            deletedAt: new Date().toISOString()
                        });
                        await db.meds.where('company').equals(comp).delete();
                        renderCompaniesPage();
                    } catch (e) { alert('خطأ'); } finally { hideLoading(); }
                }
            });
        }
        card.addEventListener('click', (e) => {
            if (e.target === del) return;
            if (batchMode) {
                toggleSelectCompany(comp);
                document.getElementById('batchRenameBtn').innerText = `تعديل جماعي (${selectedCompanies.size})`;
            } else {
                showCompanyMedicines(comp);
            }
        });
    });
}

function updateBatchRenameBtnCount() {
    const btn = document.getElementById('batchRenameBtn');
    if (btn) btn.innerText = `تعديل جماعي (${selectedCompanies.size})`;
}

async function displayCompanies(searchTerm, sortType) {
    const meds = await db.meds.toArray();
    const map = new Map();
    meds.forEach(m => {
        if (m.company && m.company.trim()) {
            if (!map.has(m.company)) map.set(m.company, { origin: m.origin || 'غير معروف', count: 1 });
            else map.get(m.company).count++;
        }
    });
    let companies = Array.from(map.entries()).map(([name, data]) => ({ name, origin: data.origin, count: data.count }));
    if (searchTerm.trim()) companies = companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (sortType === 'alpha') companies.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortType === 'count_desc') companies.sort((a, b) => b.count - a.count);
    else if (sortType === 'count_asc') companies.sort((a, b) => a.count - b.count);
    else if (sortType === 'popular') companies.sort((a, b) => b.count - a.count);

    const container = document.getElementById('companiesList');
    if (!companies.length) {
        container.innerHTML = `<div class="empty-state">${t('no_companies')}</div>`;
        return;
    }
    container.innerHTML = `<div class="companies-grid">${companies.map(c => `
        <div class="company-card" data-company="${escapeHtml(c.name)}">
            <div>🏭 ${escapeHtml(c.name)}</div>
            <div class="company-origin">📍 ${escapeHtml(c.origin)}</div>
            <div class="medicine-count">📊 ${t('medicine_count')}: ${c.count}</div>
            <button class="delete-entity-btn" data-delete="${escapeHtml(c.name)}">🗑️ حذف</button>
        </div>`).join('')}</div>`;

    document.querySelectorAll('.company-card').forEach(card => {
        const comp = card.getAttribute('data-company');
        const del = card.querySelector('.delete-entity-btn');
        if (del) {
            del.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`حذف الشركة "${comp}" وجميع أدويتها؟`)) {
                    showLoading();
                    try {
                        const medsToDelete = await db.meds.where('company').equals(comp).toArray();
                        for (let m of medsToDelete) await db.deletedMeds.add({
                            ...m,
                            deletedFromPage: 'companies',
                            deletedAt: new Date().toISOString()
                        });
                        await db.meds.where('company').equals(comp).delete();
                        renderCompaniesPage();
                    } catch (e) { alert('خطأ'); } finally { hideLoading(); }
                }
            });
        }
        card.addEventListener('click', () => showCompanyMedicines(comp));
    });
}

function filterCompanies(searchTerm) {
    currentCompaniesSearchTerm = searchTerm;
    const sortType = currentCompaniesSortType;
    displayCompanies(searchTerm, sortType);
}

function showCompanyMedicines(companyName) {
    currentCompany = companyName;
    showMedicinesByCompany(companyName);
}

async function showMedicinesByCompany(companyName) {
    const medsList = await db.meds.where('company').equals(companyName).toArray();
    const container = document.getElementById('pageContent');
    container.innerHTML = `
        <div class="company-header">
            <button id="backToCompaniesBtn" class="back-to-companies-btn">← ${t('back_to_companies')}</button>
            <h3 style="margin:16px 0;">🏭 ${escapeHtml(companyName)}</h3>
        </div>
        <div class="content-list" id="companyMedsList"></div>
    `;
    document.getElementById('backToCompaniesBtn')?.addEventListener('click', () => {
        currentCompany = null;
        renderCompaniesPage();
    });
    const listDiv = document.getElementById('companyMedsList');
    if (!medsList.length) {
        listDiv.innerHTML = `<div class="empty-state">${t('no_meds')}</div>`;
        return;
    }
    medsList.forEach(med => {
        const thumb = med.image ? `<img src="${med.image}" class="med-image-thumb">` : '<div class="med-image-thumb">💊</div>';
        const card = document.createElement('div');
        card.className = 'med-card';
        card.innerHTML = `<div class="med-info">${thumb}<div class="med-text"><div class="med-name">💊 ${escapeHtml(med.name)}</div></div></div>`;
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-button';
        delBtn.innerHTML = `<div class="trash-bin-icon"><div class="bin-lid"></div><div class="bin-container"><div class="bin-line"></div><div class="bin-line"></div></div></div>`;
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(t('delete_confirm'))) moveToDeleted(med.id, currentPage);
        });
        card.appendChild(delBtn);
        card.addEventListener('click', () => showMedDetails(med));
        listDiv.appendChild(card);
    });
}

async function renderCategoriesPage() {
    const meds = await db.meds.toArray();
    const catsMap = new Map();
    meds.forEach(m => {
        if (m.category && m.category.trim()) {
            catsMap.set(m.category, (catsMap.get(m.category) || 0) + 1);
        }
    });
    const cats = Array.from(catsMap.keys()).sort((a, b) => a.localeCompare(b));
    const container = document.getElementById('pageContent');
    if (!cats.length) {
        container.innerHTML = `<div class="empty-state">${t('no_categories')}</div>`;
        return;
    }
    container.innerHTML = `
        <button class="main-btn" id="addCategoryBtn" style="margin-bottom:16px;">إضافة تصنيف جديد</button>
        <button id="batchModeCategoriesBtn" class="main-btn" style="background:var(--warning); margin-bottom:16px;">تحديد متعدد</button>
        <button id="selectAllCategoriesBtn" class="main-btn" style="background:var(--success); display:none;">تحديد الكل</button>
        <div id="batchActionsCategoriesBar" class="batch-actions-bar" style="display:none;">
            <button id="batchRenameCategoriesBtn" class="batch-rename-btn">تعديل جماعي (0)</button>
            <button id="batchDeleteCategoriesBtn" class="batch-delete-entity-btn">🗑️ حذف جماعي</button>
            <button id="batchCancelCategoriesBtn" class="batch-cancel-btn">إلغاء التحديد</button>
        </div>
        <div class="categories-grid" id="categoriesGrid"></div>
    `;
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => addNewCategoryForList());
    const batchModeBtn = document.getElementById('batchModeCategoriesBtn');
    const selectAllCategoriesBtn = document.getElementById('selectAllCategoriesBtn');
    const batchBar = document.getElementById('batchActionsCategoriesBar');
    const renameBtn = document.getElementById('batchRenameCategoriesBtn');
    const deleteBtn = document.getElementById('batchDeleteCategoriesBtn');
    const cancelBtn = document.getElementById('batchCancelCategoriesBtn');

    if (batchModeBtn) {
        batchModeBtn.addEventListener('click', () => {
            batchMode = !batchMode;
            if (batchMode) {
                batchBar.style.display = 'flex';
                if (selectAllCategoriesBtn) selectAllCategoriesBtn.style.display = 'inline-flex';
                batchModeBtn.style.background = 'var(--success)';
                batchModeBtn.innerText = 'إلغاء التحديد';
                renderCategoriesInBatchMode(cats, catsMap);
            } else {
                batchBar.style.display = 'none';
                if (selectAllCategoriesBtn) selectAllCategoriesBtn.style.display = 'none';
                batchModeBtn.style.background = 'var(--warning)';
                batchModeBtn.innerText = 'تحديد متعدد';
                selectedCategories.clear();
                renderCategoriesPage();
            }
        });
    }
    if (selectAllCategoriesBtn) {
        selectAllCategoriesBtn.addEventListener('click', () => {
            const currentCategories = Array.from(document.querySelectorAll('#categoriesGrid .category-card')).map(card => card.getAttribute('data-category'));
            for (let cat of currentCategories) {
                if (!selectedCategories.has(cat)) {
                    toggleSelectCategory(cat);
                }
            }
            updateBatchRenameCategoriesCount();
        });
    }
    if (renameBtn) renameBtn.addEventListener('click', batchRenameCategories);
    if (deleteBtn) deleteBtn.addEventListener('click', batchDeleteCategories);
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        selectedCategories.clear();
        renameBtn.innerText = 'تعديل جماعي (0)';
        renderCategoriesPage();
    });

    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = cats.map(c => `
        <div class="category-card" data-category="${escapeHtml(c)}">
            <div>📂 ${escapeHtml(c)}</div>
            <div class="medicine-count">📊 ${t('medicine_count')}: ${catsMap.get(c)}</div>
            <button class="delete-entity-btn" data-cat="${escapeHtml(c)}">🗑️ حذف</button>
        </div>
    `).join('');

    grid.querySelectorAll('.category-card').forEach(card => {
        const cat = card.getAttribute('data-category');
        const del = card.querySelector('.delete-entity-btn');
        if (del) {
            del.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`حذف التصنيف "${cat}" وجميع أدويته؟`)) {
                    showLoading();
                    try {
                        const medsToDelete = await db.meds.where('category').equals(cat).toArray();
                        for (let m of medsToDelete) await db.deletedMeds.add({
                            ...m,
                            deletedFromPage: 'categories',
                            deletedAt: new Date().toISOString()
                        });
                        await db.meds.where('category').equals(cat).delete();
                        renderCategoriesPage();
                    } catch (e) { alert('خطأ'); } finally { hideLoading(); }
                }
            });
        }
        card.addEventListener('click', async () => {
            if (batchMode) {
                toggleSelectCategory(cat);
                updateBatchRenameCategoriesCount();
            } else {
                const filtered = (await db.meds.toArray()).filter(m => m.category === cat);
                renderMedicationsInList(filtered);
            }
        });
    });
}

function renderCategoriesInBatchMode(cats, catsMap) {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = cats.map(c => `
        <div class="category-card ${selectedCategories.has(c) ? 'selected' : ''}" data-category="${escapeHtml(c)}">
            <div>📂 ${escapeHtml(c)}</div>
            <div class="medicine-count">📊 ${t('medicine_count')}: ${catsMap.get(c)}</div>
            <div class="checkbox" style="display:flex;"></div>
            <button class="delete-entity-btn" data-cat="${escapeHtml(c)}">🗑️ حذف</button>
        </div>
    `).join('');
    grid.querySelectorAll('.category-card').forEach(card => {
        const cat = card.getAttribute('data-category');
        const del = card.querySelector('.delete-entity-btn');
        if (del) {
            del.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`حذف التصنيف "${cat}" وجميع أدويته؟`)) {
                    showLoading();
                    try {
                        const medsToDelete = await db.meds.where('category').equals(cat).toArray();
                        for (let m of medsToDelete) await db.deletedMeds.add({
                            ...m,
                            deletedFromPage: 'categories',
                            deletedAt: new Date().toISOString()
                        });
                        await db.meds.where('category').equals(cat).delete();
                        renderCategoriesPage();
                    } catch (e) { alert('خطأ'); } finally { hideLoading(); }
                }
            });
        }
        card.addEventListener('click', (e) => {
            if (e.target === del) return;
            toggleSelectCategory(cat);
            updateBatchRenameCategoriesCount();
        });
    });
}

function updateBatchRenameCategoriesCount() {
    const btn = document.getElementById('batchRenameCategoriesBtn');
    if (btn) btn.innerText = `تعديل جماعي (${selectedCategories.size})`;
}

function addNewCategoryForList() {
    const newCat = prompt('أدخل اسم التصنيف الجديد:');
    if (newCat?.trim()) {
        updateCategoriesDatalist('medCategoriesList');
        updateCategoriesDatalist('genCategoriesList');
        alert(`تمت إضافة التصنيف "${newCat}" إلى القائمة. يمكنك الآن استخدامه عند إضافة أو تعديل دواء.`);
        renderCategoriesPage();
    }
}

window.addNewCompany = async function () {
    const newComp = prompt('أدخل اسم الشركة الجديدة:');
    if (!newComp?.trim()) return;
    const origin = prompt('أدخل المنشأ (الدولة) للشركة (اختياري):', '');
    showLoading('جاري إضافة الشركة...');
    try {
        const dummy = {
            name: '___temp___',
            company: newComp.trim(),
            origin: origin || '',
            type: MED_TYPES.GENERAL,
            expiry: '9999-12-31',
            createdAt: new Date().toISOString(),
            scientificName: '', category: '', dosageForm: '', dosage: '', barcode: '', image: null
        };
        await db.meds.add(dummy);
        await db.meds.where('name').equals('___temp___').delete();
        alert(`تمت إضافة الشركة "${newComp}" بنجاح`);
        renderCompaniesPage();
    } catch (e) { alert('حدث خطأ'); } finally { hideLoading(); }
};

function renderMedicationsInList(list) {
    const container = document.getElementById('pageContent');
    container.innerHTML = `<div class="content-list" id="contentList"></div>`;
    const listDiv = document.getElementById('contentList');
    if (!list.length) {
        listDiv.innerHTML = `<div class="empty-state">${t('no_meds')}</div>`;
        return;
    }
    list.forEach(med => {
        const thumb = med.image ? `<img src="${med.image}" class="med-image-thumb">` : '<div class="med-image-thumb">💊</div>';
        const card = document.createElement('div');
        card.className = 'med-card';
        card.innerHTML = `<div class="med-info">${thumb}<div class="med-text"><div class="med-name">💊 ${escapeHtml(med.name)}</div></div></div>`;
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-button';
        delBtn.innerHTML = `<div class="trash-bin-icon"><div class="bin-lid"></div><div class="bin-container"><div class="bin-line"></div><div class="bin-line"></div></div></div>`;
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(t('delete_confirm'))) moveToDeleted(med.id, currentPage);
        });
        card.appendChild(delBtn);
        card.addEventListener('click', () => showMedDetails(med));
        listDiv.appendChild(card);
    });
}

async function renderExpiringSoonPage() {
    const list = await db.meds.toArray();
    const notifDays = parseInt(localStorage.getItem('notificationDays') || '7');
    const soon = list.filter(m => { const d = getDaysRemaining(m.expiry); return d >= 0 && d <= notifDays; });
    const container = document.getElementById('pageContent');
    container.innerHTML = `<div class="search-container"><div class="search-wrapper"><input type="text" id="search" placeholder="${t('search_placeholder')}"><button class="search-btn">${t('search_btn')}</button></div><div id="suggestionsBox" class="suggestions-list"></div></div><div class="content-list" id="contentList"></div>`;
    const searchInput = document.getElementById('search'), searchBtn = container.querySelector('.search-btn'), suggestionsBox = document.getElementById('suggestionsBox');
    if (searchBtn && searchInput) searchBtn.addEventListener('click', () => { const q = searchInput.value.trim(); if (q) performSearch(q, 'expiring'); suggestionsBox.classList.remove('show'); });
    if (searchInput) {
        searchInput.addEventListener('input', () => updateSearchSuggestions(searchInput, suggestionsBox, 'medicines'));
        searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { const q = searchInput.value.trim(); if (q) performSearch(q, 'expiring'); suggestionsBox.classList.remove('show'); } });
        searchInput.addEventListener('blur', () => setTimeout(() => suggestionsBox.classList.remove('show'), 200));
    }
    await refreshWithPagination(soon, true);
}

async function renderInbox() {
    const notifs = await db.notifications.orderBy('date').reverse().toArray();
    const container = document.getElementById('pageContent');
    if (!notifs.length) { container.innerHTML = `<div class="empty-state">${t('no_notifications')}</div>`; return; }
    container.innerHTML = notifs.map(n => `<div class="notification-item"><div>${escapeHtml(n.message)}</div><div class="notification-date">${new Date(n.date).toLocaleString()}</div></div>`).join('');
    await db.notifications.where('read').equals(false).modify({ read: true });
    updateNotifBadge();
}

async function renderExplore() {
    const container = document.getElementById('pageContent');
    container.innerHTML = `<div class="explore-tabs"><button class="tab-btn active" data-tab="categories">${t('categories')}</button><button class="tab-btn" data-tab="companies">${t('companies')}</button><button class="tab-btn" data-tab="expiring">${t('expiring_soon')}</button></div><div id="tab-categories" class="tab-content active"></div><div id="tab-companies" class="tab-content"></div><div id="tab-expiring" class="tab-content"></div>`;
    const cats = await db.meds.toArray().then(m => [...new Set(m.map(x => x.category).filter(c => c))]);
    const catsDiv = document.getElementById('tab-categories');
    if (catsDiv) {
        catsDiv.innerHTML = cats.length ? `<div class="categories-grid">${cats.map(c => `<div class="category-card" data-category="${c}">${c}<button class="delete-entity-btn" data-cat="${c}">🗑️</button></div>`).join('')}</div>` : `<div class="empty-state">${t('no_categories')}</div>`;
        catsDiv.querySelectorAll('.category-card').forEach(card => {
            const cat = card.getAttribute('data-category');
            const del = card.querySelector('.delete-entity-btn');
            if (del) del.addEventListener('click', async (e) => { e.stopPropagation(); if (confirm(`حذف التصنيف "${cat}"؟`)) { await db.meds.where('category').equals(cat).delete(); renderExplore(); } });
            card.addEventListener('click', async () => { const filtered = (await db.meds.toArray()).filter(m => m.category === cat); catsDiv.innerHTML = `<div class="content-list"></div>`; renderMedicationsInExplore(filtered, catsDiv); });
        });
    }
    const comps = await db.meds.toArray().then(m => [...new Set(m.map(x => x.company).filter(c => c && c.trim()))]);
    const compsDiv = document.getElementById('tab-companies');
    if (compsDiv) {
        compsDiv.innerHTML = comps.length ? `<div class="companies-grid">${comps.map(c => `<div class="company-card" data-company="${c}">${c}<button class="delete-entity-btn" data-company="${c}">🗑️</button></div>`).join('')}</div>` : `<div class="empty-state">${t('no_companies')}</div>`;
        compsDiv.querySelectorAll('.company-card').forEach(card => {
            const comp = card.getAttribute('data-company');
            const del = card.querySelector('.delete-entity-btn');
            if (del) del.addEventListener('click', async (e) => { e.stopPropagation(); if (confirm(`حذف الشركة "${comp}"؟`)) { await db.meds.where('company').equals(comp).delete(); renderExplore(); } });
            card.addEventListener('click', async () => { const filtered = (await db.meds.toArray()).filter(m => m.company === comp); compsDiv.innerHTML = `<div class="content-list"></div>`; renderMedicationsInExplore(filtered, compsDiv); });
        });
    }
    const soon = (await db.meds.toArray()).filter(m => getDaysRemaining(m.expiry) <= 7);
    const expDiv = document.getElementById('tab-expiring');
    if (expDiv) { expDiv.innerHTML = soon.length ? `<div class="content-list"></div>` : `<div class="empty-state">${t('no_meds')}</div>`; if (soon.length) renderMedicationsInExplore(soon, expDiv); }
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            document.getElementById(`tab-${btn.dataset.tab}`)?.classList.add('active');
        });
    });
}

function renderMedicationsInExplore(list, parentDiv) {
    const container = parentDiv.querySelector('.content-list');
    if (!container) return;
    if (!list.length) { container.innerHTML = `<div class="empty-state">${t('no_meds')}</div>`; return; }
    container.innerHTML = '';
    list.forEach(med => {
        const thumb = med.image ? `<img src="${med.image}" class="med-image-thumb">` : '<div class="med-image-thumb">💊</div>';
        const card = document.createElement('div');
        card.className = 'med-card';
        card.innerHTML = `<div class="med-info">${thumb}<div class="med-text"><div class="med-name">💊 ${escapeHtml(med.name)}</div></div></div>`;
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-button';
        delBtn.innerHTML = `<div class="trash-bin-icon"><div class="bin-lid"></div><div class="bin-container"><div class="bin-line"></div><div class="bin-line"></div></div></div>`;
        delBtn.addEventListener('click', (e) => { e.stopPropagation(); if (confirm(t('delete_confirm'))) moveToDeleted(med.id, currentPage); });
        card.appendChild(delBtn);
        card.addEventListener('click', () => showMedDetails(med));
        container.appendChild(card);
    });
}

function showAddFormModal() {
    isEditing = false;
    isInEditMode = true;
    document.getElementById('medFormTitle').innerText = t('add_med');
    document.getElementById('submitMedBtn').innerText = t('save_med');
    document.getElementById('medName').value = '';
    document.getElementById('scientificName').value = '';
    document.getElementById('company').value = '';
    document.getElementById('origin').value = '';
    document.getElementById('medCategory').value = '';
    document.getElementById('dosageForm').value = '';
    document.getElementById('dosage').value = '';
    document.getElementById('medBarcode').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('medImage').value = '';
    const defaultPeriod = parseInt(localStorage.getItem('defaultExpiryPeriod') || '365');
    const expiry1 = document.getElementById('medExpiry1');
    const expiry2 = document.getElementById('medExpiry2');
    const expiry3 = document.getElementById('medExpiry3');
    if (defaultPeriod > 0) {
        const defDate = new Date();
        defDate.setDate(defDate.getDate() + defaultPeriod);
        const defStr = defDate.toISOString().split('T')[0];
        expiry1.value = defStr;
        expiry2.value = '';
        expiry3.value = '';
    } else {
        expiry1.value = '';
        expiry2.value = '';
        expiry3.value = '';
    }
    updateCategoriesDatalist('medCategoriesList');
    openModal('medFormModal');
}

function showEditFormModal(med) {
    isEditing = true;
    isInEditMode = true;
    currentMed = med;
    document.getElementById('medFormTitle').innerText = t('edit_med');
    document.getElementById('submitMedBtn').innerText = t('save_med');
    document.getElementById('medName').value = med.name;
    document.getElementById('scientificName').value = med.scientificName || '';
    document.getElementById('company').value = med.company || '';
    document.getElementById('origin').value = med.origin || '';
    document.getElementById('medCategory').value = med.category || '';
    document.getElementById('dosageForm').value = med.dosageForm || '';
    document.getElementById('dosage').value = med.dosage || '';
    document.getElementById('medExpiry1').value = med.expiry;
    document.getElementById('medExpiry2').value = '';
    document.getElementById('medExpiry3').value = '';
    document.getElementById('medBarcode').value = med.barcode || '';
    const preview = document.getElementById('imagePreview');
    if (preview) preview.innerHTML = med.image ? `<img src="${med.image}" style="max-width:100%; max-height:100%;">` : '';
    updateCategoriesDatalist('medCategoriesList');
    openModal('medFormModal');
}

async function saveMedFromForm() {
    showLoading('جاري حفظ الدواء...');
    try {
        const name = document.getElementById('medName')?.value.trim();
        const e1 = document.getElementById('medExpiry1')?.value;
        const e2 = document.getElementById('medExpiry2')?.value;
        const e3 = document.getElementById('medExpiry3')?.value;
        const expiries = [e1, e2, e3].filter(e => e && e.trim());
        if (!name || expiries.length === 0) {
            alert(t('trade_name') + ' و ' + t('expiry_date') + ' ' + (currentLang === 'ar' ? 'مطلوبان' : 'required'));
            return;
        }
        const base = {
            name, scientificName: document.getElementById('scientificName')?.value.trim() || '',
            company: document.getElementById('company')?.value.trim() || '',
            origin: document.getElementById('origin')?.value.trim() || '',
            type: MED_TYPES.PHARMACY,
            category: document.getElementById('medCategory')?.value || '',
            dosageForm: document.getElementById('dosageForm')?.value.trim() || '',
            dosage: document.getElementById('dosage')?.value.trim() || '',
            barcode: document.getElementById('medBarcode')?.value.trim() || '',
            image: null,
            createdAt: new Date().toISOString()
        };
        const imgFile = document.getElementById('medImage')?.files[0];
        const saveOrUpdate = async (data) => {
            if (isEditing) {
                delete data.createdAt;
                data.id = currentMed.id;
                
                const duplicate = await isDuplicateMedicine(data, currentMed.id);
                if (duplicate) {
                    hideLoading();
                    alert(currentLang === 'ar' 
                        ? `لا يمكن التعديل. يوجد دواء مطابق بالفعل: ${duplicate.name} (تاريخ انتهاء: ${duplicate.expiry})`
                        : `Cannot edit. Duplicate medicine exists: ${duplicate.name} (Expiry: ${duplicate.expiry})`);
                    return;
                }
                
                await db.meds.update(currentMed.id, data);
                closeMedFormModal();
                if (currentPage === 'all') renderAllMedicines();
                else if (currentPage === 'pharmacy') renderPharmacyMedicines();
                else if (currentPage === 'expiring') renderExpiringSoonPage();
                updateBarChart();
                alert(currentLang === 'ar' ? 'تم التعديل بنجاح' : 'Updated successfully');
            } else {
                for (let expiry of expiries) {
                    const newMed = { ...data, expiry };
                    
                    const duplicate = await isDuplicateMedicine(newMed);
                    if (duplicate) {
                        hideLoading();
                        alert(currentLang === 'ar' 
                            ? `لا يمكن الإضافة. يوجد دواء مطابق بالفعل: ${duplicate.name} (تاريخ انتهاء: ${duplicate.expiry})`
                            : `Cannot add. Duplicate medicine exists: ${duplicate.name} (Expiry: ${duplicate.expiry})`);
                        return;
                    }
                    
                    await db.meds.add(newMed);
                    await addMedicineToGeneralIfNotExists(newMed);
                }
                closeMedFormModal();
                if (currentPage === 'all') renderAllMedicines();
                else if (currentPage === 'pharmacy') renderPharmacyMedicines();
                else if (currentPage === 'expiring') renderExpiringSoonPage();
                updateBarChart();
                alert(currentLang === 'ar' ? 'تمت الإضافة بنجاح' : 'Added successfully');
            }
        };
        if (imgFile) {
            const reader = new FileReader();
            reader.onload = async (e) => { base.image = e.target.result; await saveOrUpdate(base); };
            reader.readAsDataURL(imgFile);
        } else {
            if (isEditing && currentMed.image) base.image = currentMed.image;
            await saveOrUpdate(base);
        }
    } catch (err) { console.error(err); alert('حدث خطأ'); } finally { hideLoading(); }
}

function closeMedFormModal() {
    closeModal('medFormModal');
    isInEditMode = false;
    currentMed = null;
}

function showAddGeneralFormModal() {
    document.getElementById('generalFormTitle').innerText = t('add_med');
    document.getElementById('submitGeneralBtn').innerText = t('save_med');
    document.getElementById('genName').value = '';
    document.getElementById('genScientificName').value = '';
    document.getElementById('genCompany').value = '';
    document.getElementById('genOrigin').value = '';
    document.getElementById('genCategory').value = '';
    document.getElementById('genDosageForm').value = '';
    document.getElementById('genDosage').value = '';
    document.getElementById('genBarcode').value = '';
    document.getElementById('genImagePreview').innerHTML = '';
    document.getElementById('genImage').value = '';
    updateCategoriesDatalist('genCategoriesList');
    openModal('generalFormModal');
}

async function saveGeneralMedFromForm() {
    showLoading('جاري حفظ الدواء...');
    try {
        const name = document.getElementById('genName')?.value.trim();
        if (!name) {
            alert(t('trade_name') + ' ' + (currentLang === 'ar' ? 'مطلوب' : 'required'));
            return;
        }
        const medData = {
            name, scientificName: document.getElementById('genScientificName')?.value.trim() || '',
            company: document.getElementById('genCompany')?.value.trim() || '',
            origin: document.getElementById('genOrigin')?.value.trim() || '',
            type: MED_TYPES.GENERAL,
            category: document.getElementById('genCategory')?.value || '',
            dosageForm: document.getElementById('genDosageForm')?.value.trim() || '',
            dosage: document.getElementById('genDosage')?.value.trim() || '',
            barcode: document.getElementById('genBarcode')?.value.trim() || '',
            expiry: '9999-12-31',
            image: null,
            createdAt: new Date().toISOString()
        };
        
        const duplicate = await isDuplicateMedicine(medData);
        if (duplicate) {
            hideLoading();
            alert(currentLang === 'ar' 
                ? `لا يمكن الإضافة. يوجد دواء عام مطابق بالفعل: ${duplicate.name}`
                : `Cannot add. Duplicate general medicine exists: ${duplicate.name}`);
            return;
        }
        
        const imgFile = document.getElementById('genImage')?.files[0];
        const save = async (data) => {
            await db.meds.add(data);
            closeGeneralFormModal();
            if (currentPage === 'all') renderAllMedicines();
            else if (currentPage === 'pharmacy') renderPharmacyMedicines();
            updateBarChart();
            alert(currentLang === 'ar' ? 'تمت الإضافة بنجاح' : 'Added successfully');
        };
        if (imgFile) {
            const reader = new FileReader();
            reader.onload = async (e) => { medData.image = e.target.result; await save(medData); };
            reader.readAsDataURL(imgFile);
        } else {
            await save(medData);
        }
    } catch (err) { console.error(err); alert('حدث خطأ'); } finally { hideLoading(); }
}

function closeGeneralFormModal() { closeModal('generalFormModal'); }

async function updateCategoriesDatalist(datalistId) {
    const datalist = document.getElementById(datalistId);
    if (!datalist) return;
    const meds = await db.meds.toArray();
    const cats = new Set();
    meds.forEach(med => { if (med.category) cats.add(med.category); });
    const defaults = ['مضادات حيوية', 'مسكنات', 'أدوية الضغط والقلب', 'فيتامينات', 'أدوية الجهاز الهضمي', 'أدوية الجهاز التنفسي', 'أدوية السكري', 'أدوية موضعية', 'أخرى', 'Herbal medicines', 'ENT & Eye (Ophthalmological drugs)', 'Nervous system (Analgesics)', 'Cardiovascular system (Antihypertensives)', 'Infections & Antimicrobials (Antibiotics)', 'Endocrine system (Insulins & oral antidiabetics)', 'Respiratory system (Bronchodilators)'];
    defaults.forEach(c => cats.add(c));
    datalist.innerHTML = Array.from(cats).map(c => `<option value="${escapeHtml(c)}">`).join('');
}

window.addNewCategory = function (inputId) {
    const newCat = prompt('أدخل اسم التصنيف الجديد:');
    if (newCat?.trim()) {
        document.getElementById(inputId).value = newCat.trim();
        updateCategoriesDatalist('medCategoriesList');
        updateCategoriesDatalist('genCategoriesList');
    }
};

function openSettingsModal() {
    const container = document.getElementById('settingsContent');
    if (!container) {
        console.error('settingsContent element not found');
        return;
    }
    container.innerHTML = `
        <div class="settings-card" data-page="language">
            <div class="settings-card-left"><span class="settings-card-icon">🌐</span><span class="settings-card-title">${t('language')}</span></div>
            <span class="settings-card-arrow">→</span>
        </div>
        <div class="settings-card" data-page="darkmode">
            <div class="settings-card-left"><span class="settings-card-icon">🌙</span><span class="settings-card-title">${t('dark_mode')}</span></div>
            <span class="settings-card-arrow">→</span>
        </div>
        <div class="settings-card" data-page="color">
            <div class="settings-card-left"><span class="settings-card-icon">🎨</span><span class="settings-card-title">${t('change_color')}</span></div>
            <span class="settings-card-arrow">→</span>
        </div>
        <div class="settings-card" data-page="notify">
            <div class="settings-card-left"><span class="settings-card-icon">⏰</span><span class="settings-card-title">${t('notification_days')}</span></div>
            <span class="settings-card-arrow">→</span>
        </div>
        <div class="settings-card" data-page="defaultExpiry">
            <div class="settings-card-left"><span class="settings-card-icon">📅</span><span class="settings-card-title">${t('default_expiry')}</span></div>
            <span class="settings-card-arrow">→</span>
        </div>
        <div class="settings-card" data-page="searchHistory">
            <div class="settings-card-left"><span class="settings-card-icon">🔍</span><span class="settings-card-title">${t('search_history')}</span></div>
            <span class="settings-card-arrow">→</span>
        </div>
        <div class="settings-card" data-page="backupRestore">
            <div class="settings-card-left"><span class="settings-card-icon">💾</span><span class="settings-card-title">${t('backup_restore')}</span></div>
            <span class="settings-card-arrow">→</span>
        </div>
        <div class="settings-card" data-page="exportCSVPDF">
            <div class="settings-card-left"><span class="settings-card-icon">📄</span><span class="settings-card-title">${t('export_csv')} / PDF</span></div>
            <span class="settings-card-arrow">→</span>
        </div>
        <div class="settings-card" data-page="about">
            <div class="settings-card-left"><span class="settings-card-icon">ℹ️</span><span class="settings-card-title">${t('about_app')}</span></div>
            <span class="settings-card-arrow">→</span>
        </div>
    `;
    container.querySelectorAll('.settings-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const page = card.getAttribute('data-page');
            if (page === 'color') {
                showColorModal();
            } else if (page === 'language') {
                showLanguageModal();
            } else if (page === 'darkmode') {
                toggleDarkMode();
                closeModal('settingsModal');
                setTimeout(() => openSettingsModal(), 100);
            } else if (page === 'notify') {
                showNotifySettings();
            } else if (page === 'defaultExpiry') {
                showDefaultExpirySettings();
            } else if (page === 'searchHistory') {
                showSearchHistorySettings();
            } else if (page === 'backupRestore') {
                showBackupRestoreSettings();
            } else if (page === 'exportCSVPDF') {
                showExportSettings();
            } else if (page === 'about') {
                showAbout();
            }
        });
    });
    openModal('settingsModal');
}

function showLanguageModal() {
    openModal('languageModal');
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', function() {
            const newLang = this.getAttribute('data-lang');
            if (confirm(currentLang === 'ar' ? `تغيير اللغة إلى ${newLang === 'ar' ? 'العربية' : 'الإنجليزية'}؟` : `Change language to ${newLang === 'ar' ? 'Arabic' : 'English'}?`)) {
                changeLanguage(newLang);
                closeModal('languageModal');
                closeModal('settingsModal');
                setTimeout(() => openSettingsModal(), 100);
            }
        });
    });
}

function showNotifySettings() {
    const days = prompt(t('notification_days'), localStorage.getItem('notificationDays') || '7');
    if (days !== null && !isNaN(days)) {
        const d = parseInt(days);
        if (d >= 1 && d <= 90) {
            localStorage.setItem('notificationDays', d);
            alert(t('notification_set'));
        } else {
            alert(currentLang === 'ar' ? 'يجب أن تكون القيمة بين 1 و 90' : 'Value must be between 1 and 90');
        }
    }
}

function showDefaultExpirySettings() {
    const val = prompt(t('default_expiry') + ' (1-3650 يوم، 0 لإدخال يدوي)', localStorage.getItem('defaultExpiryPeriod') || '365');
    if (val !== null) {
        const period = parseInt(val);
        if (!isNaN(period) && period >= 0 && period <= 3650) {
            localStorage.setItem('defaultExpiryPeriod', period);
            alert(t('default_expiry_set'));
        } else {
            alert(currentLang === 'ar' ? 'قيمة غير صالحة' : 'Invalid value');
        }
    }
}

function showSearchHistorySettings() {
    const container = document.getElementById('settingsContent');
    if (!container) return;
    const cats = [
        { key: 'all', label: 'كل الأدوية' },
        { key: 'pharmacy', label: 'أدوية الصيدلية' },
        { key: 'companies', label: 'الشركات' },
        { key: 'expiring', label: 'المنتهية قريباً' }
    ];
    let html = `
        <div class="settings-page-header">
            <button class="settings-back-btn" id="settingsBackBtn">←</button>
            <div class="settings-page-title">${t('search_history')}</div>
        </div>
        <div id="searchHistoryContent"></div>
    `;
    container.innerHTML = html;
    const backBtn = document.getElementById('settingsBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            openSettingsModal();
        });
    }
    const contentDiv = document.getElementById('searchHistoryContent');
    if (!contentDiv) return;
    for (let cat of cats) {
        const searches = recentSearches[cat.key] || [];
        contentDiv.innerHTML += `
            <div class="history-category">
                <div class="history-category-title">
                    <span>${cat.label}</span>
                    <button class="small-btn danger-btn" data-clear="${cat.key}">مسح الكل</button>
                </div>
                <div class="history-items">
                    ${searches.map(s => `
                        <div class="history-item">
                            <span>${escapeHtml(s)}</span>
                            <button class="delete-history" data-category="${cat.key}" data-term="${escapeHtml(s)}">✖</button>
                        </div>
                    `).join('')}
                    ${searches.length === 0 ? '<span class="empty-state">لا توجد عمليات بحث سابقة</span>' : ''}
                </div>
            </div>
        `;
    }
    contentDiv.querySelectorAll('[data-clear]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-clear');
            clearSearchHistory(key);
            showSearchHistorySettings();
        });
    });
    contentDiv.querySelectorAll('.delete-history').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            const term = btn.getAttribute('data-term');
            recentSearches[category] = recentSearches[category].filter(s => s !== term);
            localStorage.setItem(`recentSearches_${category}`, JSON.stringify(recentSearches[category]));
            showSearchHistorySettings();
            if (category === 'all' && currentPage === 'all') renderAllMedicines();
            else if (category === 'pharmacy' && currentPage === 'pharmacy') renderPharmacyMedicines();
            else if (category === 'companies' && currentPage === 'companies') renderCompaniesPage();
            else if (category === 'expiring' && currentPage === 'expiring') renderExpiringSoonPage();
        });
    });
}

function showBackupRestoreSettings() {
    const container = document.getElementById('settingsContent');
    container.innerHTML = `
        <div class="settings-page-header">
            <button class="settings-back-btn" id="settingsBackBtn">←</button>
            <div class="settings-page-title">${t('backup_restore')}</div>
        </div>
        <div class="import-export-grid">
            <div class="import-export-item">
                <span>${t('all_medicines')}</span>
                <div class="import-export-buttons">
                    <button id="exportGeneralBtn" class="small-btn">${t('export_db')}</button>
                    <label class="small-btn">${t('import_db')}<input type="file" id="importGeneralInput" accept=".json" style="display:none;"></label>
                </div>
            </div>
            <div class="import-export-item">
                <span>${t('pharmacy_medicines')}</span>
                <div class="import-export-buttons">
                    <button id="exportPharmacyBtn" class="small-btn">${t('export_db')}</button>
                    <label class="small-btn">${t('import_db')}<input type="file" id="importPharmacyInput" accept=".json" style="display:none;"></label>
                </div>
            </div>
        </div>
    `;
    const backBtn = document.getElementById('settingsBackBtn');
    if (backBtn) backBtn.addEventListener('click', () => openSettingsModal());
    document.getElementById('exportGeneralBtn')?.addEventListener('click', () => exportByType(MED_TYPES.GENERAL, 'general_medicines', true));
    document.getElementById('importGeneralInput')?.addEventListener('change', e => importGeneral(e.target.files[0]));
    document.getElementById('exportPharmacyBtn')?.addEventListener('click', () => exportByType(MED_TYPES.PHARMACY, 'pharmacy_medicines', false));
    document.getElementById('importPharmacyInput')?.addEventListener('change', e => importPharmacy(e.target.files[0]));
}

function showExportSettings() {
    const container = document.getElementById('settingsContent');
    container.innerHTML = `
        <div class="settings-page-header">
            <button class="settings-back-btn" id="settingsBackBtn">←</button>
            <div class="settings-page-title">${t('export_csv')} / PDF</div>
        </div>
        <div style="display:flex; gap:12px; justify-content:center;">
            <button id="exportCsvBtn" class="save-btn">CSV</button>
            <button id="exportPdfBtn" class="save-btn">PDF</button>
        </div>
    `;
    const backBtn = document.getElementById('settingsBackBtn');
    if (backBtn) backBtn.addEventListener('click', () => openSettingsModal());
    document.getElementById('exportCsvBtn')?.addEventListener('click', exportCSV);
    document.getElementById('exportPdfBtn')?.addEventListener('click', exportPDF);
}

function showAbout() {
    const container = document.getElementById('settingsContent');
    container.innerHTML = `
        <div class="settings-page-header">
            <button class="settings-back-btn" id="settingsBackBtn">←</button>
            <div class="settings-page-title">${t('about_app')}</div>
        </div>
        <p style="text-align:center; margin-top:20px;">${t('about_text')}</p>
    `;
    const backBtn = document.getElementById('settingsBackBtn');
    if (backBtn) backBtn.addEventListener('click', () => openSettingsModal());
}

async function exportByType(type, filename, useOrig = false) {
    showLoading('جاري التصدير...');
    try {
        const meds = await db.meds.where('type').equals(type).toArray();
        let exportData;
        if (useOrig && type === MED_TYPES.GENERAL) {
            exportData = meds.map(m => ({ scientific_name: m.scientificName || '', trade_name: m.name, manufacturer_name: m.company || '', manufacturer_nationality: m.origin || '', Dose: m.dosage || '', "Dosage form": m.dosageForm || '' }));
        } else {
            exportData = { meds, type };
        }
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        saveAs(blob, `${filename}_${new Date().toISOString().slice(0, 10)}.json`);
    } finally { hideLoading(); }
}

async function importGeneral(file) {
    if (!file) return;
    showLoading('جاري الاستيراد...');
    try {
        const text = await file.text();
        let data = safeParseJSON(text);
        let meds = [];
        if (data.meds && Array.isArray(data.meds)) meds = data.meds;
        else if (Array.isArray(data)) {
            for (let item of data) {
                const trade = (item.trade_name || '').trim();
                if (!trade) continue;
                meds.push({ name: trade, scientificName: (item.scientific_name || '').trim(), company: (item.manufacturer_name || '').trim(), origin: (item.manufacturer_nationality || '').trim(), dosageForm: (item['Dosage form'] || '').trim(), dosage: (item.Dose || '').trim(), category: (item.category || '').trim(), type: MED_TYPES.GENERAL, expiry: '9999-12-31', createdAt: new Date().toISOString(), barcode: '', image: null });
            }
        } else throw new Error('تنسيق غير صحيح');
        
        meds = meds.filter(m => !m.type || m.type === MED_TYPES.GENERAL).map(m => ({ ...m, type: MED_TYPES.GENERAL }));
        
        let added = 0;
        let duplicates = 0;
        for (const med of meds) {
            const duplicate = await isDuplicateMedicine(med);
            if (duplicate) {
                duplicates++;
                continue;
            }
            await db.meds.add(med);
            added++;
        }
        
        alert(`تم الاستيراد بنجاح\nتمت إضافة: ${added} دواء\nتم تخطي المكرر: ${duplicates} دواء`);
        if (currentPage === 'all') renderAllMedicines();
        else if (currentPage === 'pharmacy') renderPharmacyMedicines();
        else if (currentPage === 'home') renderHome();
        updateCategoriesDatalist('medCategoriesList');
        updateCategoriesDatalist('genCategoriesList');
    } catch (err) { console.error(err); alert('خطأ في الملف'); } finally { hideLoading(); }
}

async function importPharmacy(file) {
    if (!file) return;
    showLoading('جاري الاستيراد...');
    try {
        const text = await file.text();
        const data = safeParseJSON(text);
        let meds = [];
        if (data.meds && Array.isArray(data.meds)) meds = data.meds;
        else if (Array.isArray(data)) meds = data;
        else throw new Error('تنسيق غير صحيح');
        
        meds = meds.filter(m => !m.type || m.type === MED_TYPES.PHARMACY).map(m => ({ ...m, type: MED_TYPES.PHARMACY }));
        
        let added = 0;
        let duplicates = 0;
        for (const med of meds) {
            const duplicate = await isDuplicateMedicine(med);
            if (duplicate) {
                duplicates++;
                continue;
            }
            await db.meds.add(med);
            added++;
        }
        
        alert(`تم الاستيراد بنجاح\nتمت إضافة: ${added} دواء\nتم تخطي المكرر: ${duplicates} دواء`);
        if (currentPage === 'all') renderAllMedicines();
        else if (currentPage === 'pharmacy') renderPharmacyMedicines();
        else if (currentPage === 'home') renderHome();
    } catch (err) { console.error(err); alert('خطأ في الملف'); } finally { hideLoading(); }
}

function safeParseJSON(content) {
    if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
    content = content.replace(/,\s*([}\]])/g, '$1');
    try { return JSON.parse(content); } catch (e) {
        const items = [];
        const regex = /\{[^{}]*\}/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            try { items.push(JSON.parse(match[0])); } catch (inner) { }
        }
        if (items.length) return items;
        throw e;
    }
}

async function exportCSV() {
    showLoading('جاري تصدير CSV...');
    try {
        const meds = await db.meds.toArray();
        const headers = ['الاسم', 'العلمي', 'الشركة', 'المنشأ', 'النوع', 'التصنيف', 'الشكل الدوائي', 'الجرعة', 'تاريخ الانتهاء', 'الباركود', 'تاريخ الإضافة'];
        const rows = meds.map(m => [m.name, m.scientificName || '', m.company || '', m.origin || '', m.type === MED_TYPES.PHARMACY ? 'صيدلية' : 'عام', m.category || '', m.dosageForm || '', m.dosage || '', m.expiry, m.barcode || '', m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '']);
        let csv = headers.join(',') + '\n' + rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'pharmacy_export.csv');
    } finally { hideLoading(); }
}

async function exportPDF() {
    showLoading('جاري تصدير PDF...');
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape' });
        const meds = await db.meds.toArray();
        const tableData = meds.map(m => [m.name, m.scientificName || '', m.company || '', m.dosageForm || '', m.dosage || '', m.expiry, m.barcode || '', m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '']);
        doc.autoTable({ head: [[t('name'), t('scientific_name'), t('company'), t('dosage_form'), t('dosage'), t('expiry_date'), t('barcode_label'), 'تاريخ الإضافة']], body: tableData, styles: { font: 'helvetica', halign: 'right' }, startY: 20 });
        doc.save('pharmacy_export.pdf');
    } finally { hideLoading(); }
}

async function checkAndSendExpiryNotifications() {
    const lastCheck = localStorage.getItem('lastNotificationCheck');
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    if (lastCheck && (now - new Date(lastCheck)) < threeDays) return;
    const notifDays = parseInt(localStorage.getItem('notificationDays') || '7');
    const meds = await db.meds.toArray();
    const expiring = meds.filter(m => { const d = getDaysRemaining(m.expiry); return d >= 0 && d <= notifDays; });
    if (!expiring.length) return;
    const threeDaysAgo = new Date(now.getTime() - threeDays);
    const toSend = [];
    for (const med of expiring) {
        const logs = await db.notificationLog.where('medId').equals(med.id).toArray();
        let count = 0;
        for (const log of logs) if (log.lastNotified && new Date(log.lastNotified) >= threeDaysAgo) count += log.count || 1;
        if (count < 2) toSend.push(med);
    }
    if (!toSend.length) return;
    if (Notification.permission === 'granted') toSend.forEach(med => { const d = getDaysRemaining(med.expiry); new Notification(`⚠️ ${med.name}`, { body: currentLang === 'ar' ? `ينتهي خلال ${d} أيام` : `Expires in ${d} days` }); });
    for (const med of toSend) {
        const d = getDaysRemaining(med.expiry);
        await db.notifications.add({ message: `${med.name} ${currentLang === 'ar' ? 'ينتهي خلال' : 'expires in'} ${d} ${currentLang === 'ar' ? 'أيام' : 'days'}`, date: new Date(), read: false, medId: med.id });
        const existing = await db.notificationLog.where('medId').equals(med.id).first();
        if (existing) {
            const last = new Date(existing.lastNotified);
            if ((now - last) < threeDays) await db.notificationLog.update(existing.id, { lastNotified: now, count: (existing.count || 1) + 1 });
            else await db.notificationLog.update(existing.id, { lastNotified: now, count: 1 });
        } else await db.notificationLog.add({ medId: med.id, lastNotified: now, count: 1 });
    }
    localStorage.setItem('lastNotificationCheck', now.toISOString());
    updateNotifBadge();
}

async function updateNotifBadge() {
    const count = await db.notifications.where('read').equals(false).count();
    const badge = document.getElementById('notifBadge');
    if (badge) { if (count > 0) { badge.innerText = count; badge.style.display = 'flex'; } else badge.style.display = 'none'; }
}

async function showMedDetails(med) {
    currentMed = med;
    const detailDiv = document.getElementById('medDetail');
    let expiryHtml = '';
    if (med.type !== MED_TYPES.GENERAL) {
        expiryHtml = `<div class="med-detail-item"><div class="med-detail-label">${t('expiry_date')}</div><div class="med-detail-value">${med.expiry}</div></div>`;
    }
    detailDiv.innerHTML = `
        <div class="med-detail-item"><div class="med-detail-label">${t('name')}</div><div class="med-detail-value">${escapeHtml(med.name)}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('scientific_name')}</div><div class="med-detail-value">${med.scientificName || '-'}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('company')}</div><div class="med-detail-value">${med.company || '-'}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('origin')}</div><div class="med-detail-value">${med.origin || '-'}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('category')}</div><div class="med-detail-value">${med.category || '-'}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('dosage_form')}</div><div class="med-detail-value">${med.dosageForm || '-'}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('dosage')}</div><div class="med-detail-value">${med.dosage || '-'}</div></div>
        ${expiryHtml}
        <div class="med-detail-item"><div class="med-detail-label">${t('barcode_label')}</div><div class="med-detail-value">${med.barcode || '-'}</div></div>
        ${med.image ? `<div class="med-image"><img src="${med.image}" style="max-width:100%; border-radius:12px;"></div>` : ''}
    `;
    const addBtn = document.getElementById('addToPharmacyBtn');
    if (addBtn) addBtn.style.display = (currentPage === 'pharmacy' || currentPage === 'companies') ? 'none' : 'inline-flex';
    
    const editBtn = document.getElementById('editMedBtn');
    const deleteBtn = document.getElementById('deleteMedBtn');
    const addPharmacyBtn = document.getElementById('addToPharmacyBtn');
    const cancelBtn = document.getElementById('cancelMedBtn');
    
    if (editBtn) {
        const newEditBtn = editBtn.cloneNode(true);
        editBtn.parentNode.replaceChild(newEditBtn, editBtn);
        newEditBtn.onclick = () => { closeModal('medModal'); showEditFormModal(med); };
    }
    if (deleteBtn) {
        const newDeleteBtn = deleteBtn.cloneNode(true);
        deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
        newDeleteBtn.onclick = () => {
            if (confirm(t('delete_confirm'))) {
                moveToDeleted(med.id, currentPage);
                closeModal('medModal');
            }
        };
    }
    if (addPharmacyBtn) {
        const newAddBtn = addPharmacyBtn.cloneNode(true);
        addPharmacyBtn.parentNode.replaceChild(newAddBtn, addPharmacyBtn);
        newAddBtn.onclick = async () => { await addToPharmacy(med); closeModal('medModal'); };
    }
    if (cancelBtn) {
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        newCancelBtn.onclick = () => closeModal('medModal');
    }
    
    openModal('medModal');
}

async function addToPharmacy(originalMed) {
    const newExpiry = prompt(t('add_expiry'), new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    if (!newExpiry) return;
    
    if (newExpiry === '9999-12-31') {
        alert('الرجاء إدخال تاريخ انتهاء صحيح');
        return;
    }
    
    const newMed = {
        name: originalMed.name, expiry: newExpiry, scientificName: originalMed.scientificName || '', company: originalMed.company || '',
        origin: originalMed.origin || '', type: MED_TYPES.PHARMACY, category: originalMed.category || '',
        barcode: originalMed.barcode || '', image: originalMed.image || null, dosageForm: originalMed.dosageForm || '',
        dosage: originalMed.dosage || '', createdAt: new Date().toISOString()
    };
    
    const duplicate = await isDuplicateMedicine(newMed);
    if (duplicate) {
        alert(currentLang === 'ar' 
            ? `لا يمكن الإضافة. يوجد دواء مطابق بالفعل في الصيدلية: ${duplicate.name} (تاريخ انتهاء: ${duplicate.expiry})`
            : `Cannot add. Duplicate medicine exists in pharmacy: ${duplicate.name} (Expiry: ${duplicate.expiry})`);
        return;
    }
    
    await db.meds.add(newMed);
    await addMedicineToGeneralIfNotExists(newMed);
    const toast = document.createElement('div'); toast.className = 'offline-toast'; toast.innerText = t('added_to_pharmacy'); document.body.appendChild(toast); setTimeout(() => toast.remove(), 2000);
    if (currentPage === 'pharmacy') renderPharmacyMedicines(); else if (currentPage === 'all') renderAllMedicines();
}

function showFirstTimeGuidance() {
    if (!localStorage.getItem('firstVisit')) {
        setTimeout(() => {
            const toast = document.createElement('div'); toast.className = 'offline-toast'; toast.style.backgroundColor = 'var(--primary)';
            toast.innerText = t('long_press_guide'); document.body.appendChild(toast); setTimeout(() => toast.remove(), 5000);
            localStorage.setItem('firstVisit', 'true');
        }, 1000);
    }
}

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    updateAllText();
    if (currentPage === 'home') updateBarChart();
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
    if (currentPage === 'home') updateBarChart();
    const savedColor = localStorage.getItem('appColor');
    if (savedColor) {
        try {
            const color = JSON.parse(savedColor);
            applyAppColor(color);
        } catch(e) { console.error(e); }
    }
}

function clearSearchHistory(pageKey) {
    recentSearches[pageKey] = [];
    localStorage.setItem(`recentSearches_${pageKey}`, '[]');
    if (pageKey === 'all' && currentPage === 'all') renderAllMedicines();
    else if (pageKey === 'pharmacy' && currentPage === 'pharmacy') renderPharmacyMedicines();
    else if (pageKey === 'companies' && currentPage === 'companies') renderCompaniesPage();
    else if (pageKey === 'expiring' && currentPage === 'expiring') renderExpiringSoonPage();
}

function setupModalBackdropClose() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    });
}

window.handleBackButton = function () {
    if (currentPage === 'home') {
        showExitConfirmation();
        return;
    }
    
    if (isInEditMode && currentMed) {
        showSaveChangesModal(
            async () => { await saveMedFromForm(); isInEditMode = false; currentMed = null; switchPage('home'); },
            () => { isInEditMode = false; currentMed = null; closeMedFormModal(); switchPage('home'); }
        );
        return;
    }
    
    if (currentCompany !== null) {
        currentCompany = null;
        renderCompaniesPage();
        return;
    }
    
    if (searchQuery !== '' && searchQuery.trim() !== '') {
        if (clearSearch()) {
            return;
        }
    }
    
    if (pageHistoryStack.length > 0) {
        const prev = pageHistoryStack.pop();
        switchPage(prev);
    } else {
        switchPage('home');
    }
};

function closeSortModal() {
    closeModal('customSortModal');
}

document.getElementById('closeSortModal')?.addEventListener('click', closeSortModal);

window.goHome = goHome;
window.switchPage = switchPage;
window.openSettingsModal = openSettingsModal;
window.closeModal = closeModal;
window.editCurrentMed = () => { if (currentMed) showEditFormModal(currentMed); };
window.addCurrentToPharmacy = () => { if (currentMed) addToPharmacy(currentMed); };
window.saveMedFromForm = saveMedFromForm;
window.closeMedFormModal = closeMedFormModal;
window.saveGeneralMedFromForm = saveGeneralMedFromForm;
window.closeGeneralFormModal = closeGeneralFormModal;
window.startBarcodeScanner = startBarcodeScanner;
window.startScannerForSearch = startScannerForSearch;
window.stopScannerAndClose = stopScannerAndClose;
window.showMedDetails = showMedDetails;
window.deleteCurrentMed = () => { if (currentMed && confirm(t('delete_confirm'))) moveToDeleted(currentMed.id, currentPage); };
window.renderAllMedicines = renderAllMedicines;
window.renderPharmacyMedicines = renderPharmacyMedicines;
window.renderHome = renderHome;
window.exportCSV = exportCSV;
window.exportPDF = exportPDF;
window.exportGeneral = () => exportByType(MED_TYPES.GENERAL, 'general_medicines', true);
window.exportPharmacy = () => exportByType(MED_TYPES.PHARMACY, 'pharmacy_medicines', false);
window.importGeneral = importGeneral;
window.importPharmacy = importPharmacy;
window.toggleDarkMode = toggleDarkMode;
window.changeLanguage = changeLanguage;
window.selectAllMeds = selectAllMeds;
window.deselectAllMeds = deselectAllMeds;
window.batchDelete = batchDelete;
window.batchAddToPharmacy = batchAddToPharmacy;
window.addNewCategory = window.addNewCategory;
window.addNewCompany = window.addNewCompany;
window.addNewCategoryForList = addNewCategoryForList;
window.handleBackButton = handleBackButton;
window.toggleSelectCompany = toggleSelectCompany;
window.toggleSelectCategory = toggleSelectCategory;
window.batchRenameCompanies = batchRenameCompanies;
window.batchRenameCategories = batchRenameCategories;

setTimeout(() => { hideLoading(); }, 4000);
window.addEventListener('error', () => hideLoading());
window.addEventListener('unhandledrejection', () => hideLoading());

const confirmExitBtn = document.getElementById('confirmExitBtn');
const cancelExitBtn = document.getElementById('cancelExitBtn');
if (confirmExitBtn) confirmExitBtn.addEventListener('click', () => { hideExitConfirmation(); if (window.close) window.close(); else alert('لا يمكن إغلاق المتصفح برمجياً'); });
if (cancelExitBtn) cancelExitBtn.addEventListener('click', hideExitConfirmation);

window.addEventListener('popstate', (event) => { event.preventDefault(); window.handleBackButton(); });

document.addEventListener('DOMContentLoaded', async () => {
    await initDemoData();
    if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');
    if (localStorage.getItem('appLang')) currentLang = localStorage.getItem('appLang');
    loadSavedColor();
    document.body.dir = 'rtl';
    updateAllText();
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') Notification.requestPermission();

    const notifBtn = document.getElementById('notifBtn');
    const settingsBtn = document.getElementById('settingsHeaderBtn');
    const headerBackBtn = document.getElementById('headerBackBtn');
    const appTitle = document.getElementById('appTitle');
    if (notifBtn) notifBtn.onclick = () => switchPage('inbox');
    if (settingsBtn) settingsBtn.onclick = () => openSettingsModal();
    if (headerBackBtn) headerBackBtn.onclick = () => window.handleBackButton();
    if (appTitle) appTitle.onclick = () => window.goHome();

    const submitMed = document.getElementById('submitMedBtn');
    if (submitMed) submitMed.onclick = saveMedFromForm;
    const medImage = document.getElementById('medImage');
    if (medImage) medImage.onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => { document.getElementById('imagePreview').innerHTML = `<img src="${ev.target.result}" style="max-width:100%; max-height:100%;">`; };
            reader.readAsDataURL(file);
        }
    };
    const submitGeneral = document.getElementById('submitGeneralBtn');
    if (submitGeneral) submitGeneral.onclick = saveGeneralMedFromForm;
    const genImage = document.getElementById('genImage');
    if (genImage) genImage.onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => { document.getElementById('genImagePreview').innerHTML = `<img src="${ev.target.result}" style="max-width:100%; max-height:100%;">`; };
            reader.readAsDataURL(file);
        }
    };

    document.getElementById('closeMedModal')?.addEventListener('click', () => closeModal('medModal'));
    document.getElementById('closeMedFormModal')?.addEventListener('click', closeMedFormModal);
    document.getElementById('closeGeneralFormModal')?.addEventListener('click', closeGeneralFormModal);
    document.getElementById('closeScannerModal')?.addEventListener('click', stopScannerAndClose);
    document.getElementById('closeSettingsModal')?.addEventListener('click', () => closeModal('settingsModal'));
    document.getElementById('cancelMedFormBtn')?.addEventListener('click', closeMedFormModal);
    document.getElementById('cancelGeneralFormBtn')?.addEventListener('click', closeGeneralFormModal);
    document.getElementById('cancelScannerBtn')?.addEventListener('click', stopScannerAndClose);
    document.getElementById('cancelMedBtn')?.addEventListener('click', () => closeModal('medModal'));
    document.getElementById('closeLanguageModal')?.addEventListener('click', () => closeModal('languageModal'));
    document.getElementById('closeColorModal')?.addEventListener('click', () => closeModal('colorModal'));
    document.getElementById('closeExitModal')?.addEventListener('click', () => closeModal('exitConfirmModal'));
    document.getElementById('closeSaveChangesModal')?.addEventListener('click', () => closeModal('saveChangesModal'));

    setupModalBackdropClose();

    updateCategoriesDatalist('medCategoriesList');
    updateCategoriesDatalist('genCategoriesList');

    detectIOSDevice();
    testDeviceCompatibility();

    history.pushState({ page: currentPage }, '');
    switchPage('home');
    checkAndSendExpiryNotifications();
});

