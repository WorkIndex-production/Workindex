const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const seoDir = path.join(root, 'seo-pages');
const sitemapPath = path.join(root, 'sitemap.xml');
const site = 'https://workindex.co.in';
const today = '2026-05-14';

const services = {
  'itr-filing': {
    title: 'ITR Filing',
    serviceType: 'Income Tax Return Filing',
    hero: 'Income tax return filing help with documents, AIS/Form 26AS review, salary, business, capital gains, freelancer and NRI income.',
    needs: ['Form 16 based salaried ITR', 'business and professional income returns', 'capital gains from shares, mutual funds, property or crypto', 'rental income and home loan interest reporting', 'AIS/Form 26AS mismatch review', 'NRI or foreign income support where applicable'],
    docs: ['PAN and Aadhaar', 'Form 16, salary slips and investment proofs', 'AIS, TIS and Form 26AS', 'bank statements and interest certificates', 'capital gain statements or property sale documents', 'P&L, balance sheet and GST data for business cases'],
    pricing: 'Simple salaried returns usually start around Rs. 1,000 to Rs. 2,500. Freelancer, business, capital gains or foreign income cases commonly range from Rs. 3,000 to Rs. 15,000 depending on complexity.',
    national: '/seo-pages/itr-filing-services.html'
  },
  'gst-services': {
    title: 'GST Services',
    serviceType: 'GST Registration and Return Filing',
    hero: 'GST registration, GSTR-1, GSTR-3B, ITC reconciliation, notices, amendments, cancellation and monthly compliance support.',
    needs: ['GST registration and amendment', 'monthly or quarterly GSTR-1 and GSTR-3B filing', 'ITC reconciliation with GSTR-2B', 'ecommerce, restaurant or trading GST support', 'GST notice and cancellation help', 'annual return and books-to-GST reconciliation'],
    docs: ['GSTIN and portal access or authorization', 'sales and purchase invoices', 'bank statements and payment records', 'GSTR-1, GSTR-3B and GSTR-2B data', 'e-way bill, ecommerce or POS reports where applicable', 'notice copies and prior filing history'],
    pricing: 'GST registration usually ranges from Rs. 1,000 to Rs. 5,000. Return filing may start around Rs. 500 to Rs. 1,500 for simple/nil filings and move to Rs. 3,000 to Rs. 15,000 per month for reconciliation-heavy work.',
    national: '/seo-pages/gst-filing-services.html'
  },
  'accounting-services': {
    title: 'Accounting Services',
    serviceType: 'Accounting and Bookkeeping',
    hero: 'Monthly bookkeeping, bank reconciliation, GST-linked accounts, payroll, MIS, accounting cleanup and business reporting.',
    needs: ['monthly bookkeeping and ledger posting', 'bank and cash reconciliation', 'GST-ready sales and purchase books', 'payroll and vendor payment tracking', 'MIS, P&L and balance sheet preparation', 'backlog accounting cleanup'],
    docs: ['bank statements and cash book', 'sales and purchase invoices', 'expense bills and receipts', 'GST returns and ledgers if applicable', 'payroll, loan and asset data', 'previous books or Tally/Zoho/Excel exports'],
    pricing: 'Micro bookkeeping can start around Rs. 1,000 to Rs. 2,500 per month. Small business accounting commonly ranges from Rs. 2,500 to Rs. 5,000 per month, while high-volume books can move to Rs. 10,000 to Rs. 25,000 per month.',
    national: '/seo-pages/accounting-bookkeeping-services.html'
  },
  'audit-services': {
    title: 'Audit Services',
    serviceType: 'Audit and Assurance',
    hero: 'Tax audit, statutory audit, internal audit, stock audit, due diligence, compliance review and audit-ready books support.',
    needs: ['tax audit for business or professional income', 'statutory audit for companies', 'internal controls and process audit', 'stock, vendor or branch audit', 'due diligence for funding, loans or acquisition', 'audit-ready books and GST reconciliation'],
    docs: ['trial balance, ledgers and financial statements', 'sales, purchase and expense records', 'GST, TDS and payroll filings', 'fixed asset and inventory records', 'bank statements and loan confirmations', 'board records and ROC filings where applicable'],
    pricing: 'Small compliance audits may start around Rs. 5,000 to Rs. 18,000. Tax audits often range from Rs. 8,000 to Rs. 80,000 depending on turnover and books quality, while statutory/internal/due-diligence work can be higher.',
    national: '/seo-pages/company-compliance-services.html'
  }
};

const locations = {
  bangalore: {
    name: 'Bangalore',
    display: 'Bengaluru',
    region: 'Karnataka',
    context: 'Bengaluru has a strong startup, IT, SaaS, ecommerce, professional services, retail and consulting ecosystem. Finance work here often involves salary with ESOP/RSU components, founder compliance, GST for services, contractor payments and investor-ready books.',
    sectors: ['startups and SaaS companies', 'IT and consulting professionals', 'ecommerce and D2C sellers', 'restaurants, clinics and retail stores', 'freelancers, creators and agency owners']
  },
  mysore: {
    name: 'Mysore',
    display: 'Mysuru',
    region: 'Karnataka',
    context: 'Mysuru combines tourism, education, retail, manufacturing, services and a growing startup/IT base. Businesses often need GST, accounting, payroll and ITR support for mixed local and online income.',
    sectors: ['tourism and hospitality', 'education and coaching', 'small manufacturers', 'retail and traders', 'service professionals']
  },
  mangalore: {
    name: 'Mangalore',
    display: 'Mangaluru',
    region: 'Coastal Karnataka',
    context: 'Mangaluru is a coastal commercial centre with port-linked trade, education, healthcare, hospitality, fisheries and NRI-linked families. Tax and compliance work often includes business income, rental/property income, GST and NRI documentation.',
    sectors: ['port-linked traders', 'healthcare and education businesses', 'hospitality and restaurants', 'fisheries and exporters', 'NRI taxpayers and property owners']
  },
  hubli: {
    name: 'Hubli',
    display: 'Hubballi',
    region: 'North Karnataka',
    context: 'Hubballi-Dharwad is a major commercial and industrial hub and an important railway junction. Dharwad district has industrial areas and activity in automobile, garments, food processing, engineering and IT/BT zones.',
    sectors: ['traders and wholesalers', 'engineering and auto ancillary units', 'transport and logistics businesses', 'food processing and garments', 'professionals and salaried taxpayers']
  },
  dharwad: {
    name: 'Dharwad',
    display: 'Dharwad',
    region: 'North Karnataka',
    context: 'Dharwad is an academic and cultural centre connected with the Hubballi-Dharwad commercial belt. The district has industrial areas, education institutions, service businesses and a growing MSME base.',
    sectors: ['education and coaching services', 'MSMEs and service firms', 'auto, garment and food processing units', 'consultants and professionals', 'retail and trading businesses']
  },
  davanagere: {
    name: 'Davanagere',
    display: 'Davanagere',
    region: 'Central Karnataka',
    context: 'Davanagere is a major trading venue in central Karnataka, historically associated with cotton mills and now linked with cotton, maize, chickpea, sunflower, rice and other commercial crop trade along with education and agro-processing.',
    sectors: ['cotton and agro traders', 'food and agro-processing units', 'education businesses', 'restaurants and retail shops', 'transport and commission agents']
  },
  shivamogga: {
    name: 'Shivamogga',
    display: 'Shivamogga',
    region: 'Malnad Karnataka',
    context: 'Shivamogga has a strong Malnad economy with agriculture, arecanut/coconut-linked activity, food processing, engineering, automobile-based units, tourism, education and MSMEs. Local tax work often involves farm-linked business families, traders, professionals and small industries.',
    sectors: ['arecanut, coconut and agri-linked businesses', 'food processing and rice mill clusters', 'engineering and automobile units', 'tourism and hospitality', 'education and healthcare professionals']
  },
  belagavi: {
    name: 'Belagavi',
    display: 'Belagavi',
    region: 'North Karnataka',
    context: 'Belagavi is a major industrial and trading district known for foundry, engineering, auto components, agro-processing, textiles and defence/aerospace-linked manufacturing potential.',
    sectors: ['foundry and engineering units', 'auto component businesses', 'agro-processing and trading', 'textile and manufacturing firms', 'contractors and transport businesses']
  },
  ballari: {
    name: 'Ballari',
    display: 'Ballari',
    region: 'Kalyana Karnataka',
    context: 'Ballari is known as a steel and textile-linked business centre with mining, trading, transport, manufacturing and retail activity. Finance work often needs strong records for GST, stock, payroll, contractors and audit readiness.',
    sectors: ['steel and mining-linked businesses', 'textile and garment traders', 'transport contractors', 'retail and wholesale firms', 'manufacturing suppliers']
  },
  udupi: {
    name: 'Udupi',
    display: 'Udupi',
    region: 'Coastal Karnataka',
    context: 'Udupi is a coastal district with strong banking, education, tourism, hospitality, food processing, fisheries, jasmine/cashew activity and technology businesses around Manipal.',
    sectors: ['hospitality and restaurant businesses', 'banking and service professionals', 'cashew, fisheries and food processing', 'education and healthcare services', 'IT and Manipal-linked startups']
  },
  hassan: {
    name: 'Hassan',
    display: 'Hassan',
    region: 'South Karnataka',
    context: 'Hassan has agriculture, tourism, education, small industries and businesses connected with Bengaluru-Mangaluru movement. Local finance work often involves traders, professionals, contractors and agri-linked businesses.',
    sectors: ['agri and trading businesses', 'tourism and hospitality', 'education and healthcare services', 'contractors and transport firms', 'small industries']
  },
  tumkur: {
    name: 'Tumkur',
    display: 'Tumakuru',
    region: 'Bengaluru region',
    context: 'Tumakuru is emerging as a major industrial growth area with manufacturing, automobiles, pharmaceuticals, biotechnology, heavy engineering, electronics, logistics and food processing opportunities around the industrial township corridor.',
    sectors: ['manufacturing and engineering units', 'automobile and component suppliers', 'food and beverage businesses', 'logistics and transport firms', 'pharma, biotech and electronics-linked MSMEs']
  },
  mandya: {
    name: 'Mandya',
    display: 'Mandya',
    region: 'South Karnataka',
    context: 'Mandya is known for agriculture, sugarcane, rice, small businesses, trading and Bengaluru-Mysuru corridor activity. Compliance work often includes agri-linked businesses, contractors, retailers and salaried taxpayers.',
    sectors: ['sugarcane and rice-linked businesses', 'traders and retailers', 'contractors and transport operators', 'restaurants and local services', 'salaried and professional taxpayers']
  },
  kolar: {
    name: 'Kolar',
    display: 'Kolar',
    region: 'Bengaluru region',
    context: 'Kolar has agriculture, dairy, trading, small manufacturing, Bengaluru-linked professionals and logistics movement. Tax and GST support is often needed by traders, contractors, small industries and service providers.',
    sectors: ['agri and dairy-linked businesses', 'traders and wholesalers', 'small manufacturers', 'transport and logistics operators', 'Bengaluru-linked professionals']
  },
  chitradurga: {
    name: 'Chitradurga',
    display: 'Chitradurga',
    region: 'Central Karnataka',
    context: 'Chitradurga has agriculture, wind energy, logistics, education, stone/mineral-linked activity and growing industrial potential. Businesses often need GST, accounting, audit and contractor compliance.',
    sectors: ['agri traders', 'wind and energy contractors', 'stone/mineral-linked businesses', 'transport operators', 'education and local service businesses']
  },
  chikkamagaluru: {
    name: 'Chikkamagaluru',
    display: 'Chikkamagaluru',
    region: 'Malnad Karnataka',
    context: 'Chikkamagaluru has coffee estates, tourism, homestays, hospitality, agriculture and trading. Finance work often involves estate income, GST for hospitality, payroll and property/rental income.',
    sectors: ['coffee estates and agri businesses', 'homestays and resorts', 'tourism operators', 'restaurants and retail', 'professionals and property owners']
  },
  bidar: {
    name: 'Bidar',
    display: 'Bidar',
    region: 'Kalyana Karnataka',
    context: 'Bidar has agriculture, education, small industries, trading and border-region commerce with Maharashtra/Telangana. Local businesses often need GST, books, contractor compliance and ITR support.',
    sectors: ['agri traders', 'education and coaching services', 'retail and wholesale businesses', 'contractors and transporters', 'small industries']
  },
  bijapur: {
    name: 'Vijayapura',
    display: 'Vijayapura',
    region: 'North Karnataka',
    context: 'Vijayapura has agriculture, tourism, construction, trading and education businesses. Tax work often includes contractors, property income, retail GST and business ITR.',
    sectors: ['construction and contractors', 'tourism and hospitality', 'agri traders', 'education businesses', 'retail and service firms']
  },
  gulbarga: {
    name: 'Kalaburagi',
    display: 'Kalaburagi',
    region: 'Kalyana Karnataka',
    context: 'Kalaburagi is an important regional centre with cement, education, healthcare, trading, construction and service businesses. GST, accounting and audit support is often needed for contractors and MSMEs.',
    sectors: ['cement and construction-linked businesses', 'education and healthcare services', 'retail and wholesale traders', 'contractors and transport firms', 'MSMEs']
  },
  raichur: {
    name: 'Raichur',
    display: 'Raichur',
    region: 'Kalyana Karnataka',
    context: 'Raichur has agriculture, rice mills, cotton, power-sector activity, trading and transport businesses. Local finance work often needs stock, GST, payroll and audit-ready records.',
    sectors: ['rice mills and agri traders', 'cotton-linked businesses', 'power and contractor services', 'transport operators', 'retail and wholesale firms']
  },
  hebbal: {
    name: 'Hebbal',
    display: 'Hebbal, Bengaluru',
    region: 'Bengaluru',
    context: 'Hebbal is a Bengaluru growth corridor with tech parks, professionals, rentals, startups, clinics, restaurants and service businesses.',
    sectors: ['IT professionals and consultants', 'startups and service firms', 'rental property owners', 'clinics and restaurants', 'freelancers']
  },
  yelahanka: {
    name: 'Yelahanka',
    display: 'Yelahanka, Bengaluru',
    region: 'Bengaluru',
    context: 'Yelahanka serves North Bengaluru residents, airport corridor businesses, professionals, schools, clinics, retail stores and startups.',
    sectors: ['airport corridor businesses', 'IT and salaried professionals', 'schools and clinics', 'retail and restaurants', 'property owners']
  },
  mahadevapura: {
    name: 'Mahadevapura',
    display: 'Mahadevapura, Bengaluru',
    region: 'Bengaluru',
    context: 'Mahadevapura and Whitefield belt customers often include IT employees, SaaS teams, contractors, ecommerce sellers, startups and service businesses.',
    sectors: ['IT employees with ESOP/RSU income', 'SaaS and startup founders', 'contractors and consultants', 'ecommerce sellers', 'clinics and retail stores']
  },
  brookefield: {
    name: 'Brookefield',
    display: 'Brookefield, Bengaluru',
    region: 'Bengaluru',
    context: 'Brookefield is part of the Whitefield commercial belt with IT professionals, apartments, restaurants, clinics, consultants and small businesses.',
    sectors: ['IT professionals', 'consultants and freelancers', 'restaurants and clinics', 'property owners', 'small service businesses']
  },
  marathahalli: {
    name: 'Marathahalli',
    display: 'Marathahalli, Bengaluru',
    region: 'Bengaluru',
    context: 'Marathahalli connects major IT corridors and has salaried professionals, PG/rental income, retail, restaurants, coaching, clinics and startup services.',
    sectors: ['salaried IT employees', 'rental property owners', 'retail and restaurants', 'coaching and clinics', 'freelancers and consultants']
  },
  'sarjapur-road': {
    name: 'Sarjapur Road',
    display: 'Sarjapur Road, Bengaluru',
    region: 'Bengaluru',
    context: 'Sarjapur Road has startup founders, IT professionals, residential communities, schools, clinics, restaurants and service businesses.',
    sectors: ['IT and startup professionals', 'schools and clinics', 'restaurants and retail', 'freelancers', 'property owners']
  },
  'btm-layout': {
    name: 'BTM Layout',
    display: 'BTM Layout, Bengaluru',
    region: 'Bengaluru',
    context: 'BTM Layout has students, coaching centres, startups, consultants, restaurants, rental properties, clinics and small businesses.',
    sectors: ['coaching and education businesses', 'consultants and freelancers', 'restaurants and retailers', 'rental property owners', 'clinics and service firms']
  },
  jayanagar: {
    name: 'Jayanagar',
    display: 'Jayanagar, Bengaluru',
    region: 'Bengaluru',
    context: 'Jayanagar has established professionals, doctors, clinics, retailers, restaurants, consultants, rental property owners and family businesses.',
    sectors: ['doctors and clinics', 'family businesses', 'retail and restaurants', 'consultants', 'property owners']
  },
  'jp-nagar': {
    name: 'JP Nagar',
    display: 'JP Nagar, Bengaluru',
    region: 'Bengaluru',
    context: 'JP Nagar serves South Bengaluru professionals, consultants, clinics, schools, restaurants, property owners and small businesses.',
    sectors: ['professionals and consultants', 'clinics and schools', 'restaurants and retail stores', 'property owners', 'freelancers']
  },
  banashankari: {
    name: 'Banashankari',
    display: 'Banashankari, Bengaluru',
    region: 'Bengaluru',
    context: 'Banashankari has residential, education, retail, clinic, restaurant and family-business customers who often need practical tax and GST help.',
    sectors: ['family businesses', 'retail and restaurants', 'schools and coaching centres', 'clinics', 'property owners']
  },
  basavanagudi: {
    name: 'Basavanagudi',
    display: 'Basavanagudi, Bengaluru',
    region: 'Bengaluru',
    context: 'Basavanagudi has established families, professionals, traditional businesses, clinics, educational institutions and rental-property taxpayers.',
    sectors: ['traditional businesses', 'doctors and professionals', 'education services', 'property owners', 'retail stores']
  },
  'gandhi-bazar': {
    name: 'Gandhi Bazar',
    display: 'Gandhi Bazar, Bengaluru',
    region: 'Bengaluru',
    context: 'Gandhi Bazar has retail traders, traditional businesses, restaurants, professionals and property owners who need GST, accounting and ITR support.',
    sectors: ['retail traders', 'traditional businesses', 'restaurants', 'professionals', 'property owners']
  },
  malleshwaram: {
    name: 'Malleshwaram',
    display: 'Malleshwaram, Bengaluru',
    region: 'Bengaluru',
    context: 'Malleshwaram has professionals, family businesses, clinics, retail, education services, rental property owners and established taxpayers.',
    sectors: ['professionals and consultants', 'family businesses', 'clinics', 'retail and restaurants', 'property owners']
  },
  rajajinagar: {
    name: 'Rajajinagar',
    display: 'Rajajinagar, Bengaluru',
    region: 'Bengaluru',
    context: 'Rajajinagar and nearby industrial/trading belts include manufacturing suppliers, traders, service businesses, clinics, restaurants and property owners.',
    sectors: ['manufacturing suppliers', 'traders and retailers', 'service businesses', 'clinics and restaurants', 'property owners']
  },
  vijayanagar: {
    name: 'Vijayanagar',
    display: 'Vijayanagar, Bengaluru',
    region: 'Bengaluru',
    context: 'Vijayanagar serves West Bengaluru residents, traders, restaurants, education businesses, professionals and rental-property taxpayers.',
    sectors: ['traders and retailers', 'restaurants and local services', 'education businesses', 'professionals', 'property owners']
  },
  kengeri: {
    name: 'Kengeri',
    display: 'Kengeri, Bengaluru',
    region: 'Bengaluru',
    context: 'Kengeri has residential growth, Mysuru Road businesses, education institutions, construction-linked activity, retail and service firms.',
    sectors: ['Mysuru Road businesses', 'construction and contractors', 'education services', 'retail stores', 'property owners']
  },
  uttarahalli: {
    name: 'Uttarahalli',
    display: 'Uttarahalli, Bengaluru',
    region: 'Bengaluru',
    context: 'Uttarahalli has residential communities, small businesses, clinics, schools, restaurants, freelancers and property owners.',
    sectors: ['residential taxpayers', 'schools and clinics', 'restaurants and retail', 'freelancers', 'property owners']
  },
  'rr-nagar': {
    name: 'RR Nagar',
    display: 'RR Nagar, Bengaluru',
    region: 'Bengaluru',
    context: 'RR Nagar has residential communities, professionals, educational institutions, clinics, service businesses and property owners.',
    sectors: ['professionals', 'education and coaching services', 'clinics', 'retail and restaurants', 'property owners']
  },
  'kr-puram': {
    name: 'KR Puram',
    display: 'KR Puram, Bengaluru',
    region: 'Bengaluru',
    context: 'KR Puram connects East Bengaluru residential and IT corridors with contractors, retailers, clinics, restaurants, property owners and service professionals.',
    sectors: ['IT corridor professionals', 'contractors and service firms', 'retailers and restaurants', 'clinics', 'property owners']
  },
  yeshwanthpur: {
    name: 'Yeshwanthpur',
    display: 'Yeshwanthpur, Bengaluru',
    region: 'Bengaluru',
    context: 'Yeshwanthpur is a transport, trading and industrial-commercial belt with wholesalers, logistics operators, contractors, manufacturers and retail businesses.',
    sectors: ['wholesale traders', 'logistics and transport operators', 'industrial suppliers', 'contractors', 'retail businesses']
  }
};

function esc(value) {
  return String(value || '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
}

function titleCase(slug) {
  return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

const mappings = [
  { match: /mumbai|pune|nagpur|thane|navi-mumbai|kalyan|dombivli|nashik|kolhapur|aurangabad|bhiwandi|solapur|sangli|satara|chandrapur|bhandara|gondia|wardha|yavatmal|ratnagiri|malad|borivali|dadar|worli|powai|lower-parel|hadapsar|kharadi|kothrud|hinjewadi|magarpatta|viman-nagar|pimpri-chinchwad|andheri|bandra|ghatkopar|goregaon|mira-road|panvel|vasai-virar-city|aundh|baner|akola-city|amravati-city|dhule-city|gadchiroli|jalgaon-city|latur-city|nanded-city|washim|koregaon-park|buldhana/, state: 'Maharashtra' },
  { match: /chennai|coimbatore|madurai|salem|karur|erode|hosur|velachery|tambaram|chromepet|nungambakkam|omr-road|t-nagar|thanjavur|trichy|dindigul|cuddalore|nagapattinam|nagercoil|pollachi|ramanathapuram|sivaganga|thoothukudi|tirunelveli|tiruppur|vellore|villupuram|virudhunagar|adyar|anna-nagar|ambattur|sholinganallur|porur|dharmapuri-city|krishnagiri-city|kumbakonam|namakkal-city|ooty-city/, state: 'Tamil Nadu' },
  { match: /hyderabad|gachibowli|hitech-city|madhapur|kukatpally|miyapur|secunderabad|warangal|nizamabad|karimnagar|khammam|suryapet|mahbubnagar|alwal|attapur|kompally|kondapur|mehdipatnam|moosapet|nanakramguda|tellapur|lb-nagar|banjara-hills|jubilee-hills|financial-district|ameerpet/, state: 'Telangana' },
  { match: /kolkata|howrah|salt-lake|rajarhat|new-town|ballygunge|park-street|durgapur|siliguri|bardhaman|asansol|haldia|barasat|barrackpore|bankura|berhampore|bishnupur|contai|cooch-behar|jalpaiguri|malda|midnapore|murshidabad|nadia|tamluk|arambag|kharagpur-city|krishnanagar-city/, state: 'West Bengal' },
  { match: /ahmedabad|surat|vadodara|rajkot|jamnagar|bhavnagar|gandhinagar|bhuj|kutch|gandhidham|mehsana|morbi|navsari|porbandar|valsad|vapi|sg-highway|adajan|attwalines|citylight|katargam|parle-point|piplod|udhna|varachha|vesu|akota|alkapuri|fatehgunj|gorwa|harni|karelibaug|manjalpur|sayajigunj|waghodia-road|amreli|anand-city/, state: 'Gujarat' },
  { match: /jaipur|jodhpur|udaipur|kota|bikaner|ajmer|churu|barmer|chittorgarh|jhunjhunu|nagaur|pali|sawai-madhopur|sikar|sri-ganganagar|tonk|alwar-city|bharatpur-city|bundi|bundi-city|dungarpur|hanumangarh/, state: 'Rajasthan' },
  { match: /indore|bhopal|jabalpur|gwalior|ujjain|ratlam|rewa|sagar|satna|dewas|katni|singrauli|khandwa|morena|bhind|shivpuri|guna|mandsaur|neemuch|palasia|rau|ring-road|sapna-sangeeta|vijay-nagar|arera-colony|hoshangabad-road|kolar-road|mp-nagar|new-market/, state: 'Madhya Pradesh' },
  { match: /kochi|thiruvananthapuram|calicut|thrissur|kannur|kollam|aluva|edappally|ernakulam|fort-kochi|kakkanad|kalamassery|maradu|palarivattom|tripunithura|vytilla/, state: 'Kerala' },
  { match: /patna|gaya|muzaffarpur|bhagalpur/, state: 'Bihar' },
  { match: /lucknow|kanpur|agra|varanasi|allahabad|prayagraj|meerut|bareilly|firozabad|gorakhpur|jhansi|aligarh|moradabad|saharanpur|hapur|mathura|rampur|shahjahanpur|muzaffarnagar|budaun|gomti-nagar|hazratganj|civil-lines|kidwai-nagar|swaroop-nagar|lanka|nadesar|sigra|ghaziabad/, state: 'Uttar Pradesh' },
  { match: /chandigarh/, state: 'Chandigarh' },
  { match: /ludhiana|amritsar|jalandhar|patiala|bathinda|phagwara|kapurthala|moga|sangrur|pathankot|gurdaspur|hoshiarpur/, state: 'Punjab' },
  { match: /gurgaon|faridabad|panipat|rohtak|hisar|karnal|yamunanagar|sirsa|bhiwani|rewari|panchkula|ambala-city/, state: 'Haryana' },
  { match: /bhubaneswar|cuttack|balasore|sambalpur|rourkela/, state: 'Odisha' },
  { match: /raipur|bilaspur|durg|bhilai/, state: 'Chhattisgarh' },
  { match: /ranchi|jamshedpur|dhanbad|bokaro/, state: 'Jharkhand' },
  { match: /guwahati|silchar|dibrugarh|jorhat|tezpur/, state: 'Assam' },
  { match: /dehradun|rishikesh|roorkee|haridwar|haldwani|rudrapur/, state: 'Uttarakhand' },
  { match: /jammu|srinagar/, state: 'Jammu & Kashmir' },
  { match: /panaji|goa/, state: 'Goa' },
  { match: /visakhapatnam|vijayawada|guntur|nellore|kurnool|rajahmundry|tirupati|kakinada|gajuwaka|vizianagaram|vizag|bheemunipatnam|madhurawada|mvp-colony|pm-palem|rushikonda|seethammadhara|steel-city|anantapur/, state: 'Andhra Pradesh' },
  { match: /shimla|baddi|solan|una|dharamshala|parwanoo|dharamsala-city/, state: 'Himachal Pradesh' },
  { match: /dimapur|kohima/, state: 'Nagaland' },
  { match: /gangtok/, state: 'Sikkim' },
  { match: /imphal/, state: 'Manipur' },
  { match: /shillong/, state: 'Meghalaya' },
  { match: /noida|greater-noida/, state: 'Uttar Pradesh' },
  { match: /mohali|derabassi|zirakpur/, state: 'Punjab' },
  { match: /delhi|karol-bagh|lajpat-nagar|rohini|saket|dwarka|connaught-place|nehru-place/, state: 'Delhi' },
  { match: /agartala-city/, state: 'Tripura' },
  { match: /aizawl-city/, state: 'Mizoram' },
  { match: /pondicherry/, state: 'Puducherry' },
];

function locationFor(slug) {
  if (locations[slug]) return locations[slug];
  let state = 'Karnataka';
  for (const m of mappings) {
    if (m.match.test(slug)) {
      state = m.state;
      break;
    }
  }
  return {
    name: titleCase(slug),
    display: titleCase(slug),
    region: state,
    context: `${titleCase(slug)} customers include salaried taxpayers, traders, small businesses, contractors, professionals and property owners who need practical finance, tax, GST, accounting and compliance support.`,
    sectors: ['salaried and professional taxpayers', 'retail and trading businesses', 'contractors and service providers', 'clinics, schools and restaurants', 'property owners and freelancers']
  };
}


function schema(prefix, service, loc, slug) {
  const url = `${site}/seo-pages/${prefix}-${slug}.html`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${site}/#organization`, name: 'WorkIndex', url: site },
      { '@type': 'Service', name: `${service.title} in ${loc.display}`, serviceType: service.serviceType, provider: { '@id': `${site}/#organization` }, areaServed: { '@type': 'Place', name: loc.display }, description: `${service.hero} For ${loc.display}, ${loc.region}.` },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'WorkIndex', item: site }, { '@type': 'ListItem', position: 2, name: service.title, item: `${site}${service.national}` }, { '@type': 'ListItem', position: 3, name: loc.display, item: url }] },
      { '@type': 'FAQPage', mainEntity: [
        { '@type': 'Question', name: `How do I find ${service.title.toLowerCase()} experts in ${loc.display}?`, acceptedAnswer: { '@type': 'Answer', text: `Post your requirement on WorkIndex with service type, budget, location and documents. Relevant experts serving ${loc.display} can respond with pricing and next steps.` } },
        { '@type': 'Question', name: `What documents are needed for ${service.title.toLowerCase()} in ${loc.display}?`, acceptedAnswer: { '@type': 'Answer', text: service.docs.join(', ') } }
      ] }
    ]
  }, null, 2);
}

function render(prefix, service, loc, slug) {
  const title = `${service.title} in ${loc.display}`;
  const desc = `Find verified experts for ${service.title.toLowerCase()} in ${loc.display}. Local guidance for ${loc.region} taxpayers, businesses, traders, professionals and MSMEs. Compare quotes on WorkIndex.`;
  const relatedSameLocation = Object.keys(services)
    .filter((item) => item !== prefix)
    .map((item) => `<a class="lp-step" href="/seo-pages/${item}-${slug}.html" style="text-decoration:none;color:inherit;"><h3>${esc(services[item].title)} in ${esc(loc.display)}</h3><p>Compare experts for ${esc(services[item].title.toLowerCase())} in the same location.</p></a>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(title)} | WorkIndex</title>
<meta name="description" content="${esc(desc)}"/>
<meta name="keywords" content="${esc(`${service.title} ${loc.display}, CA ${loc.display}, ${service.serviceType} ${loc.region}, WorkIndex ${loc.display}`)}"/>
<link rel="canonical" href="${site}/seo-pages/${prefix}-${slug}.html"/>
<meta property="og:title" content="${esc(title)} | WorkIndex"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:url" content="${site}/seo-pages/${prefix}-${slug}.html"/>
<meta property="og:type" content="website"/>
<link rel="icon" type="image/png" href="/favicon.png"/>
<link rel="stylesheet" href="/lp-styles.css"/>
<style>.wi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}.wi-grid ul{margin:10px 0 0;padding-left:20px;line-height:1.75}.wi-box{padding:16px 18px;border:1px solid rgba(252,128,25,.25);background:rgba(252,128,25,.08);border-radius:12px;line-height:1.75}.wi-table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}.wi-table th,.wi-table td{padding:14px;border-bottom:1px solid #eef2f7;text-align:left;vertical-align:top}.wi-table th{background:#f8fafc;color:#334155}</style>
<script type="application/ld+json">${schema(prefix, service, loc, slug)}</script>
</head>
<body>
<nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="/?signup=true" class="lp-nav-cta">Post for Free</a></nav>
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><a href="${service.national}">${esc(service.title)}</a><span>/</span><span>${esc(loc.display)}</span></div>
<section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>${esc(service.title)} - ${esc(loc.display)}, ${esc(loc.region)}</div><h1>${esc(title)}<br><span>Local experts for real business context</span></h1><p>${esc(service.hero)} ${esc(loc.context)} Post your requirement free and compare relevant professionals before hiring.</p><a href="/?signup=true" class="lp-hero-cta">Post Your Requirement - Free</a><div class="lp-hero-trust"><div class="lp-trust-item">Verified professional discovery</div><div class="lp-trust-item">Location-aware service context</div><div class="lp-trust-item">Compare quotes and timelines</div><div class="lp-trust-item">Built for Indian tax and compliance</div></div></section>
<div class="lp-stats"><div class="lp-stat"><div class="lp-stat-value">Local</div><div class="lp-stat-label">${esc(loc.display)} context</div></div><div class="lp-stat"><div class="lp-stat-value">Free</div><div class="lp-stat-label">Customer posting</div></div><div class="lp-stat"><div class="lp-stat-value">Compare</div><div class="lp-stat-label">Expert responses</div></div></div>
<section class="lp-section"><div class="lp-section-eyebrow">Local Economy</div><h2 class="lp-section-title">Why ${esc(loc.display)} customers need tailored ${esc(service.title.toLowerCase())}</h2><p class="lp-section-sub">${esc(loc.context)}</p><div class="wi-grid"><div class="lp-step"><h3>Common local customer types</h3>${list(loc.sectors)}</div><div class="lp-step"><h3>Popular ${esc(service.title.toLowerCase())} needs</h3>${list(service.needs)}</div><div class="lp-step"><h3>Documents to keep ready</h3>${list(service.docs)}</div></div></section>
<section class="lp-section"><div class="lp-section-eyebrow">Pricing</div><h2 class="lp-section-title">Expected pricing in ${esc(loc.display)}</h2><div class="wi-box">${esc(service.pricing)} Final fees depend on urgency, document quality, transaction volume, notices, audit scope and whether the expert must clean up earlier records.</div></section>
<section class="lp-section"><div class="lp-section-eyebrow">How to choose</div><h2 class="lp-section-title">Questions to ask before hiring</h2><div class="wi-grid"><div class="lp-step"><h3>Service fit</h3>${list(['Have you handled similar customers in this location or sector?', 'What exact documents do you need before final quote?', 'What is included and excluded in your fee?', 'How quickly can you complete it if documents are ready?'])}</div><div class="lp-step"><h3>Quality checks</h3>${list(['Will you check AIS/Form 26AS or GST portal data where relevant?', 'Will books, GST and tax numbers be reconciled before filing?', 'How will notices, corrections or follow-up questions be handled?', 'Can I compare your profile, ratings and service experience?'])}</div></div></section>
<section class="lp-section"><div class="lp-section-eyebrow">WorkIndex Flow</div><h2 class="lp-section-title">How WorkIndex helps in ${esc(loc.display)}</h2><div class="lp-steps"><div class="lp-step"><div class="lp-step-num">1</div><h3>Post a structured requirement</h3><p>Choose ${esc(service.title.toLowerCase())}, add budget, urgency, location preference and documents available.</p></div><div class="lp-step"><div class="lp-step-num">2</div><h3>Experts review real context</h3><p>Professionals can see the service scope before responding, which reduces blind calls and vague quotes.</p></div><div class="lp-step"><div class="lp-step-num">3</div><h3>Compare and proceed</h3><p>Compare responses, pricing, ratings and profile strength before selecting the right expert.</p></div></div></section>
<section class="lp-section"><div class="lp-section-eyebrow">Comparison</div><h2 class="lp-section-title">Manual search vs WorkIndex</h2><div style="overflow-x:auto"><table class="wi-table"><thead><tr><th>Option</th><th>What you get</th><th>Risk</th></tr></thead><tbody><tr><td><strong>Manual local search</strong></td><td>Call individual CAs or consultants one by one.</td><td>Hard to compare scope, timelines and pricing.</td></tr><tr><td><strong>Generic freelance sites</strong></td><td>Large supply of freelancers across many categories.</td><td>May not understand local Indian tax, GST and audit context.</td></tr><tr><td><strong>WorkIndex</strong></td><td>Structured requirement, expert discovery and comparison for finance/professional services.</td><td>Best suited when service context, trust and documentation matter.</td></tr></tbody></table></div></section>
<section class="lp-section"><div class="lp-section-eyebrow">Related Services</div><h2 class="lp-section-title">More services in ${esc(loc.display)}</h2><div class="lp-steps">${relatedSameLocation}</div></section>
<section class="lp-cta-section"><h2>${esc(title)} - Free to Post</h2><p>Tell WorkIndex what you need. Relevant professionals can respond with price, timeline and next steps.</p><a href="/?signup=true" class="lp-hero-cta">Get Expert Quotes</a></section>
<footer class="lp-footer"><a href="${service.national}">${esc(service.title)} India</a><a href="/seo-pages/professional-services-marketplace.html">Professional Services Marketplace</a><a href="/contact.html">Contact</a></footer>
</body>
</html>
`;
}

const files = fs.readdirSync(seoDir).filter((name) => /^(itr-filing|gst-services|accounting-services|audit-services)-.+\.html$/.test(name));
let rewritten = 0;
const touched = [];

for (const file of files) {
  const match = file.match(/^(itr-filing|gst-services|accounting-services|audit-services)-(.+)\.html$/);
  if (!match) continue;
  const [, prefix, slug] = match;
  if (['india', 'karnataka'].includes(slug)) continue;
  const service = services[prefix];
  const loc = locationFor(slug);
  fs.writeFileSync(path.join(seoDir, file), render(prefix, service, loc, slug), 'utf8');
  rewritten += 1;
  touched.push(`${site}/seo-pages/${file}`);
}

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
for (const loc of touched) {
  const escaped = loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(<url><loc>${escaped}</loc><priority>[^<]+</priority><changefreq>monthly</changefreq><lastmod>)[^<]+(</lastmod></url>)`, 'g');
  sitemap = sitemap.replace(re, `$1${today}$2`);
}
fs.writeFileSync(sitemapPath, sitemap, 'utf8');

console.log(`rewritten=${rewritten}`);
