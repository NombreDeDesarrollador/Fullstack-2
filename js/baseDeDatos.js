// =====================================================================
// BASE DE DATOS DE PRODUCTOS
// Los productos ahora viven en localStorage para que los cambios hechos
// desde el panel de administrador (crear/editar/eliminar) se reflejen
// también en el catálogo y el detalle de producto de la tienda.
// =====================================================================

const productosIniciales = [
    { codigo: "GA001", nombre: "Guitarra Acústica Folk", marca: "Yamaha", categoria: "Guitarras Acústicas", precio: 149990, stock: 18, stockCritico: 4, descripcion: "Sonido cálido y definido, perfecta para fingerpicking y composiciones íntimas.", imagen: "https://www.blupointmusic.cl/wp-content/uploads/2020/07/guitare-classique-yamaha-cg122ms.png" },
    { codigo: "GA002", nombre: "Guitarra Acústica Dreadnought", marca: "Fender", categoria: "Guitarras Acústicas", precio: 189990, stock: 5, stockCritico: 1, descripcion: "Cuerpo grande con excelente proyección de volumen y graves profundos.", imagen: "https://www.fender.com/cdn-cgi/image/format=auto,resize=height=auto,width=500/https://images.ctfassets.net/mdpgzc1lmx9t/BYKt7UMe776XlKhhQGmT5/ea9e727a02dbff4ddccfdf72ec50d0ca/dreadnought_body_plp_tile_v2.png" },
    { codigo: "GA003", nombre: "Guitarra Acústica Clásica 4/4", marca: "Yamaha", categoria: "Guitarras Acústicas", precio: 129990, stock: 12, stockCritico: 2, descripcion: "Cuerdas de nylon, ideal para estudiantes y música clásica o folclórica.", imagen: "https://cdnx.jumpseller.com/instruments/image/69265064/resize/480/480?1762098705" },
    { codigo: "GA004", nombre: "Guitarra Electroacústica", marca: "Takamine", categoria: "Guitarras Acústicas", precio: 299990, stock: 3, stockCritico: 1, descripcion: "Preamplificador integrado de alta calidad, lista para conectar y tocar en vivo.", imagen: "https://i5.walmartimages.cl/asr/933570b1-4852-4b78-916c-ef27f4795881.a4f43d07f8a286d07cc670417b8e9219.png?odnHeight=612&odnWidth=612&odnBg=FFFFFF" },
    { codigo: "GA005", nombre: "Guitarra 3/4 Niños", marca: "Yamaha", categoria: "Guitarras Acústicas", precio: 99990, stock: 0, stockCritico: 0, descripcion: "Tamaño reducido, perfecta para los primeros pasos musicales de los más pequeños.", imagen: "https://www.stockmusical.com/60807-home_default/guitarra-clasica-rocio-c16-3-4.jpg" },
    { codigo: "GE001", nombre: "Guitarra Eléctrica Stratocaster", marca: "Squier", categoria: "Guitarras Eléctricas", precio: 219990, stock: 15, stockCritico: 3, descripcion: "El diseño más icónico, versátil para rock, pop, blues y funk.", imagen: "https://i5.walmartimages.cl/asr/a4f54c98-ac25-4390-9159-0a4626b27c75.6441ce67cfa2eb6d123d016d18e8fd36.png?odnHeight=612&odnWidth=612&odnBg=FFFFFF" },
    { codigo: "GE002", nombre: "Guitarra Eléctrica Les Paul", marca: "Epiphone", categoria: "Guitarras Eléctricas", precio: 349990, stock: 4, stockCritico: 1, descripcion: "Cápsulas humbucker potentes, ideal para rock clásico y hard rock.", imagen: "https://i5.walmartimages.cl/asr/a0c115c8-7798-4399-b55b-a49bd3f2daf9.0eba58507b884d597743dd4155fdd064.png?odnHeight=2000&odnWidth=2000&odnBg=ffffff" },
    { codigo: "GE003", nombre: "Guitarra Eléctrica SG", marca: "Epiphone", categoria: "Guitarras Eléctricas", precio: 329990, stock: 7, stockCritico: 1, descripcion: "Cuerpo ligero, acceso fácil a los trastes altos y un tono agresivo.", imagen: "https://rdmusico.cl/cdn/shop/files/VS6VW_grande.jpg?v=1728309612" },
    { codigo: "GE004", nombre: "Guitarra Eléctrica Telecaster", marca: "Squier", categoria: "Guitarras Eléctricas", precio: 229990, stock: 9, stockCritico: 2, descripcion: "Tono brillante y percusivo, la reina del country, indie y rock alternativo.", imagen: "https://rdmusico.cl/cdn/shop/files/E2BLK.png?v=1752523188&width=1920" },
    { codigo: "GE005", nombre: "Guitarra Eléctrica Semi-hollow", marca: "Epiphone", categoria: "Guitarras Eléctricas", precio: 459990, stock: 2, stockCritico: 1, descripcion: "Cuerpo semi-hueco que ofrece una resonancia cálida, perfecta para jazz y blues.", imagen: "https://factorysound.cl/30431-large_default/V72HFTB.jpg" },
    { codigo: "BA001", nombre: "Bajo Eléctrico 4 Cuerdas", marca: "Squier", categoria: "Bajos Eléctricos", precio: 249990, stock: 6, stockCritico: 1, descripcion: "Diseño Precision, tono gordo y contundente para marcar el ritmo.", imagen: "https://lacasadelmusico.cl/wp-content/uploads/2026/05/SQUIER_3_73e04596-9658-4fa5-bbdf-db5f640195da_600x.png" },
    { codigo: "BA002", nombre: "Bajo Eléctrico Jazz Bass", marca: "Fender", categoria: "Bajos Eléctricos", precio: 699990, stock: 1, stockCritico: 1, descripcion: "Mástil rápido y dos cápsulas que permiten una versatilidad tonal increíble.", imagen: "https://musicworks.cl/wp-content/uploads/2025/09/Fender-Flea-Signature-Jazz-Bass-RW-Roadworn-Shell-Pink-1200x1200-1-e1765725128268.png" },
    { codigo: "BA003", nombre: "Bajo Acústico 4 Cuerdas", marca: "Yamaha", categoria: "Bajos Eléctricos", precio: 279990, stock: 4, stockCritico: 1, descripcion: "Ideal para sesiones desenchufadas y práctica en casa sin amplificador.", imagen: "https://www.dragg.cl/image/cache/data/productos/artiny/QAG-4295/QAG-4295-600x600.png" },
    { codigo: "BT001", nombre: "Batería Acústica 5 piezas", marca: "Pearl", categoria: "Baterías", precio: 549990, stock: 2, stockCritico: 1, descripcion: "Set completo con atriles, lista para rockear desde el primer día.", imagen: "https://factorysound.cl/41763-product_zoom/MP-PDG5254TC-DR.jpg" },
    { codigo: "BT002", nombre: "Batería Electrónica 8 pads", marca: "Roland", categoria: "Baterías", precio: 489990, stock: 5, stockCritico: 1, descripcion: "Módulo con cientos de sonidos y pads de malla para una sensación realista.", imagen: "https://minback.cotzulai.com/promarketgo-products/products/7006009083_01-lg.webp" },
    { codigo: "BT003", nombre: "Caja Snare 14\"", marca: "Pearl", categoria: "Baterías", precio: 119990, stock: 8, stockCritico: 2, descripcion: "Caja de acero que ofrece un ataque cortante y gran sensibilidad.", imagen: "https://www.dragg.cl/image/cache/data/productos/gloria/caja/PVC14%20azul-600x600.png" },
    { codigo: "BT004", nombre: "Platillo Hi-Hat 14\"", marca: "Zildjian", categoria: "Baterías", precio: 189990, stock: 10, stockCritico: 2, descripcion: "Sonido definido, ideal para todos los estilos musicales.", imagen: "https://cdnx.jumpseller.com/sagas-music-shop/image/32591214/HCS14-H-web-main.jpg?1677472802" },
    { codigo: "BT005", nombre: "Platillo Crash 16\"", marca: "Zildjian", categoria: "Baterías", precio: 149990, stock: 6, stockCritico: 1, descripcion: "Apertura rápida y decaimiento brillante para acentos potentes.", imagen: "https://grandmusicsas.com/wp-content/uploads/2025/07/ilh16c_16_i_crash_angle_shot_630x630-500x500.webp" },
    { codigo: "TC001", nombre: "Teclado Digital 61 teclas", marca: "Yamaha", categoria: "Teclados y Pianos", precio: 169990, stock: 14, stockCritico: 3, descripcion: "Teclas sensibles al tacto y cientos de voces integradas para aprender.", imagen: "https://cdnx.jumpseller.com/instruments/image/69119305/thumb/960/960?1761609774" },
    { codigo: "TC002", nombre: "Piano Digital 88 teclas", marca: "Yamaha", categoria: "Teclados y Pianos", precio: 499990, stock: 3, stockCritico: 1, descripcion: "Acción de martillo graduado para una experiencia de piano de cola real.", imagen: "https://gearhub.cl/cdn/shop/files/gearhub_yamaha_p145b_teclado_1.png?v=1736516929&width=1080" },
    { codigo: "TC003", nombre: "Sintetizador 49 teclas", marca: "Arturia", categoria: "Teclados y Pianos", precio: 329990, stock: 0, stockCritico: 0, descripcion: "Motor de síntesis analógica virtual para crear bajos y leads.", imagen: "https://cdnx.jumpseller.com/gorila-music/image/74033422/resize/719/719?1772469375" },
    { codigo: "TC004", nombre: "Teclado MIDI 88 teclas", marca: "M-Audio", categoria: "Teclados y Pianos", precio: 219990, stock: 9, stockCritico: 2, descripcion: "Controlador para tu DAW, con teclas semi-pesadas.", imagen: "https://cdnx.jumpseller.com/audiomarket-pro/image/64644662/resize/2157/2157?1750269021" },
    { codigo: "AM001", nombre: "Amplificador Guitarra 15W", marca: "Fender", categoria: "Amplificadores", precio: 109990, stock: 20, stockCritico: 4, descripcion: "Tamaño compacto ideal para practicar en habitación con un gran tono.", imagen: "https://astrings.co.uk/cdn/shop/products/2313700000_amp_frt_001_nr.png?v=1648127094" },
    { codigo: "AM002", nombre: "Amplificador Guitarra 40W", marca: "Marshall", categoria: "Amplificadores", precio: 249990, stock: 8, stockCritico: 2, descripcion: "Potencia suficiente para ensayos y tocatas pequeñas, con distorsión clásica.", imagen: "https://static.sonovente.com/img/library/alpha/66/66386.png" },
    { codigo: "AM003", nombre: "Amplificador Bajo 100W", marca: "Hartke", categoria: "Amplificadores", precio: 319990, stock: 4, stockCritico: 1, descripcion: "Cono de aluminio que brinda un ataque rápido y graves definidos.", imagen: "https://holocaustomusic.com/cdn/shop/files/HD15_1342bd4b-ad85-4d1b-8210-735c7a2a5e83_1080x.png?v=1756860289" },
    { codigo: "AM004", nombre: "Amplificador Acústico 40W", marca: "Fishman", categoria: "Amplificadores", precio: 299990, stock: 5, stockCritico: 1, descripcion: "Respeta el tono natural de tu guitarra acústica e incluye entrada de micrófono.", imagen: "https://static.sonovente.com/img/library/alpha/92/92456.png" },
    { codigo: "MI001", nombre: "Micrófono Dinámico Cardioide", marca: "Shure", categoria: "Micrófonos", precio: 99990, stock: 30, stockCritico: 6, descripcion: "El estándar de la industria para voces en vivo, indestructible.", imagen: "https://products.shureweb.eu/cdn-cgi/image/width=1380,height=1380,format=auto/shure_product_db/product_images/files/4ec/aad/c6-/original/70140eaceaa2dc539b25f82300ca79b8.webp" },
    { codigo: "MI002", nombre: "Micrófono Dinámico Instrumento", marca: "Shure", categoria: "Micrófonos", precio: 95990, stock: 15, stockCritico: 3, descripcion: "Perfecto para amplificadores de guitarra y cajas de batería.", imagen: "https://studiomusic.cl/cdn/shop/products/shure-beta-56a-microfono-dinamico-de-instrumento-microfonos-dinamicos-shure-363464.webp?v=1660240459&width=1298" },
    { codigo: "MI003", nombre: "Micrófono Condensador", marca: "Audio-Tech.", categoria: "Micrófonos", precio: 139990, stock: 7, stockCritico: 1, descripcion: "Captura cada detalle de tu voz o guitarra acústica en el estudio.", imagen: "https://i5.walmartimages.cl/asr/81cb16af-c682-4e03-9808-c6c6eb9db8dc.01d586fa3214f4cd4166ff13e77afb72.png?odnHeight=612&odnWidth=612&odnBg=FFFFFF" },
    { codigo: "MI004", nombre: "Micrófono USB de Condensador", marca: "Blue", categoria: "Micrófonos", precio: 129990, stock: 12, stockCritico: 2, descripcion: "Conecta directamente al PC, excelente para podcasting y streaming.", imagen: "https://tauretcomputadores.com/images/products/Product_202507151521371013589923.PNG%20PERFIL.webp" },
    { codigo: "PE001", nombre: "Pedal Distorsión", marca: "Boss", categoria: "Pedales de Efectos", precio: 69990, stock: 18, stockCritico: 4, descripcion: "El tono naranja clásico que ha definido décadas de rock.", imagen: "https://cdnx.jumpseller.com/instruments/image/69615034/thumb/960/960?1762982987" },
    { codigo: "PE002", nombre: "Pedal Reverb", marca: "Boss", categoria: "Pedales de Efectos", precio: 129990, stock: 9, stockCritico: 2, descripcion: "Añade desde un ambiente sutil hasta texturas espaciales gigantes.", imagen: "https://images.squarespace-cdn.com/content/v1/5767f5fc6b8f5b316becd639/1484535227259-PKBZQQFU2CT0SM6JDITJ/boss-rv6.png?format=1500w" },
    { codigo: "PE003", nombre: "Pedal Multi-efectos", marca: "Boss", categoria: "Pedales de Efectos", precio: 219990, stock: 4, stockCritico: 1, descripcion: "Arsenal de efectos, emuladores de amplificador y looper en uno.", imagen: "https://cdnx.jumpseller.com/instruments/image/69615094/thumb/719/719?1762983137" },
    { codigo: "PE004", nombre: "Pedal Tuner Cromático", marca: "Boss", categoria: "Pedales de Efectos", precio: 89990, stock: 25, stockCritico: 5, descripcion: "Afinación precisa y rápida, indispensable en cualquier pedalboard.", imagen: "https://www.jpmusical.com/cdn/shop/files/Boss_ChromaticTuner-TU3_InclinedView_800x.png?v=1691437919" },
    { codigo: "PE005", nombre: "Pedal Delay", marca: "MXR", categoria: "Pedales de Efectos", precio: 149990, stock: 6, stockCritico: 1, descripcion: "Ecos cálidos y analógicos que se funden con tu tono base.", imagen: "https://cdn.shopify.com/s/files/1/0370/1873/0628/files/mxrwide_1_1024x1024.png?v=1630103971" },
    { codigo: "PE006", nombre: "Pedal Overdrive", marca: "Ibanez", categoria: "Pedales de Efectos", precio: 109990, stock: 11, stockCritico: 2, descripcion: "El verde legendario para empujar tu amplificador a tubos al límite.", imagen: "https://www.ibanez.com/common/product_artist_file/file/p_region_TS9_en_1.png" },
    { codigo: "AC001", nombre: "Cuerdas Guitarra Eléctrica 09-42", marca: "Ernie Ball", categoria: "Accesorios", precio: 8990, stock: 50, stockCritico: 10, descripcion: "Las Super Slinky, brillo y facilidad para estirar las cuerdas.", imagen: "https://cdnx.jumpseller.com/musicchile/image/57538291/f836113f-78e6-4e5d-98ef-5c0e3c88fb58-open-uri20220519-2507-p3b4ds.png?1755894767" },
    { codigo: "AC002", nombre: "Cuerdas Guitarra Acústica 12-53", marca: "Ernie Ball", categoria: "Accesorios", precio: 10990, stock: 45, stockCritico: 9, descripcion: "Bronce fosforado para un tono profundo y resonante.", imagen: "https://palmmute.cl/wp-content/uploads/2023/01/Cuerdas-Ernie-Ball-Earthwood-80-20-Bronze-11-52.png" },
    { codigo: "AC003", nombre: "Cuerdas Bajo 45-105", marca: "Ernie Ball", categoria: "Accesorios", precio: 24990, stock: 30, stockCritico: 6, descripcion: "Durabilidad extrema y un growl inconfundible.", imagen: "https://prostringschile.cl/cdn/shop/files/P02852.png?v=1726016563" },
    { codigo: "AC004", nombre: "Púas de Guitarra x10 (0.73mm)", marca: "Fender", categoria: "Accesorios", precio: 4990, stock: 100, stockCritico: 20, descripcion: "Grosor medio ideal para rasgueo acústico y soleo eléctrico.", imagen: "https://www.musimaster.com/61511-product_size/caja-de-puas-fender-70-aniversario.jpg" },
    { codigo: "AC005", nombre: "Capotraste Guitarra", marca: "Dunlop", categoria: "Accesorios", precio: 15990, stock: 22, stockCritico: 4, descripcion: "Mecanismo de gatillo para cambios rápidos sin desafinar.", imagen: "https://www.matchmusic.cl/cdn/shop/files/dunlop-cejillo-capo-guitarra-acustica-83cb-trigger-curvado-color-negro.png?v=1779329155&width=500" },
    { codigo: "AC006", nombre: "Afinador de Clip", marca: "Snark", categoria: "Accesorios", precio: 12990, stock: 0, stockCritico: 0, descripcion: "Pantalla LED brillante y detección de nota por vibración.", imagen: "https://cdn11.bigcommerce.com/s-b354d/images/stencil/1280x1280/products/4607/6958/Snark-Tuner-Ireland__74312.1772039520.png?c=2" },
    { codigo: "AC007", nombre: "Cable Instrumento 3m", marca: "D'Addario", categoria: "Accesorios", precio: 19990, stock: 35, stockCritico: 7, descripcion: "Transmisión de señal pura sin ruido de interferencia, ideal para casa.", imagen: "https://cdnx.jumpseller.com/gorila-music/image/69019739/da_pw-gra-10_detail2a_transparent_web.png?1782013301" },
    { codigo: "AC008", nombre: "Cable Instrumento 6m", marca: "D'Addario", categoria: "Accesorios", precio: 29990, stock: 28, stockCritico: 6, descripcion: "Libertad de movimiento para el escenario sin pérdida de tono.", imagen: "https://cl-cenco-pim-resizer.ecomm.cencosud.com/unsafe/adaptive-fit-in/3840x0/filters:quality(75)/prd-cl/product-medias/83a4018b-2bda-4bdb-8093-045bf5eabef8/MKOOSN8G4O/MKOOSN8G4O-1/1732821388155-MKOOSN8G4O-1-1.png" },
    { codigo: "AC009", nombre: "Soporte Guitarra de Piso", marca: "Hercules", categoria: "Accesorios", precio: 22990, stock: 14, stockCritico: 3, descripcion: "Sistema Auto-Grip que asegura el instrumento automáticamente.", imagen: "https://sonikaecuador.com/56280-home_default/soporte-guitarra-hercules-gs432b-plus-3-servicios.jpg" },
    { codigo: "AC010", nombre: "Soporte Guitarra de Pared", marca: "Hercules", categoria: "Accesorios", precio: 14990, stock: 40, stockCritico: 8, descripcion: "Exhibe tu guitarra segura y lista para tocar en cualquier momento.", imagen: "https://www.salaomusical.com/16278-superlarge_default/soporte-de-pared-hercules-gsp38wbkplus-negro-para-guitarra.jpg" },
    { codigo: "ES001", nombre: "Interfaz de Audio 2x2 USB", marca: "Focusrite", categoria: "Estudio y Grabación", precio: 159990, stock: 10, stockCritico: 2, descripcion: "Preamplificadores cristalinos para grabar maquetas con calidad profesional.", imagen: "https://armonicos.cl/1887-thickbox_default/focusrite-scarlett-2i2-3rd-gen.jpg" },
    { codigo: "ES002", nombre: "Auriculares de Estudio", marca: "Audio-Tech.", categoria: "Estudio y Grabación", precio: 59990, stock: 16, stockCritico: 3, descripcion: "Respuesta plana para mezclar sin colorear el sonido.", imagen: "https://www.blupointmusic.cl/wp-content/uploads/2020/12/ath-m50x_04.png" },
    { codigo: "ES003", nombre: "Auriculares de Estudio Pro", marca: "Audio-Tech.", categoria: "Estudio y Grabación", precio: 149990, stock: 5, stockCritico: 1, descripcion: "Aislamiento superior y detalle sonoro clínico para masterización.", imagen: "https://b2811249.assetcdn.net/2811249/wp-content/uploads/2020/12/ath-m50x_01-400x400.png?lossy=1&strip=1&webp=1" },
    { codigo: "ES004", nombre: "Monitor de Estudio 5\"", marca: "Yamaha", categoria: "Estudio y Grabación", precio: 189990, stock: 8, stockCritico: 2, descripcion: "El estándar blanco icónico, la verdad absoluta sobre tu mezcla.", imagen: "https://cdnx.jumpseller.com/instruments/image/71160854/thumb/1079/1079?1766964868" },
    { codigo: "ES005", nombre: "Pop Filter para Micrófono", marca: "Sennheiser", categoria: "Estudio y Grabación", precio: 24990, stock: 22, stockCritico: 4, descripcion: "Elimina las consonantes explosivas al grabar voces.", imagen: "https://edge.rode.com/images/page/395/modules/1439/R%C3%98DE_NT5_SINGLE_WS5_1080x1080.png" }
];

const categoriasDisponibles = [
    "Guitarras Acústicas",
    "Guitarras Eléctricas",
    "Bajos Eléctricos",
    "Baterías",
    "Teclados y Pianos",
    "Amplificadores",
    "Micrófonos",
    "Pedales de Efectos",
    "Accesorios",
    "Estudio y Grabación"
];

const VERSION_CATALOGO = 2;

function inicializarProductos() {
    const versionGuardada = localStorage.getItem('productos_version');
    if (!localStorage.getItem('productos') || versionGuardada !== String(VERSION_CATALOGO)) {
        localStorage.setItem('productos', JSON.stringify(productosIniciales));
        localStorage.setItem('productos_version', String(VERSION_CATALOGO));
    }
}

function obtenerProductos() {
    inicializarProductos();
    return JSON.parse(localStorage.getItem('productos'));
}

function guardarProductos(lista) {
    localStorage.setItem('productos', JSON.stringify(lista));
}

function buscarProductoPorCodigo(codigo) {
    return obtenerProductos().find(p => p.codigo === codigo);
}

inicializarProductos();