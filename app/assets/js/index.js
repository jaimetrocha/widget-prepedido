// Acordeón principal
const acordeonPrincipal = (querySelector) => {
  document.querySelectorAll(`${querySelector}`).forEach(btn => {
    btn.addEventListener('click', () => {
      btn.nextElementSibling.classList.toggle('hidden');
    });
  });
}

// Subacordeón
document.querySelectorAll('.subaccordion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.nextElementSibling.classList.toggle('hidden');
  });
});

// Modal
// const dialog = document.getElementById("myDialog")
// const openButton = document.getElementById("openDialog")
// const closeButton = document.getElementById("closeDialog")

// openButton.addEventListener("click", () =>{
//   dialog.showModal()
// })

// closeButton.addEventListener("click", () =>{
//   dialog.close()
// })

const handleModal = (idDialog, openDialog, closeDialog) => {

  const dialog = document.getElementById(idDialog)
  const openButton = document.getElementById(openDialog)
  const closeButton = document.getElementById(closeDialog)

  dialog.showModal();

  if (closeButton) {
    closeButton.addEventListener("click", () => dialog.close());
  }

}

// Conexión Creator

const obtenerProyectosPorUsuario = async () => {
  const config = {
    app_name: "inventory-1-0",       // tu aplicación
    report_name: "USUARIOS_PROYECTOS_Report", // tu reporte
  };

  try {

    const response = await ZOHO.CREATOR.DATA.getRecords(config)
    return response.data

  } catch (error) {
    return error
  }

}

const obtenerTrabajos = async (idProyecto) => {
  const config = {
    app_name: "inventory-1-0",       // tu aplicación
    report_name: "REL_CUENTAS_Report", // tu reporte
    criteria: `PROYECTO == ${idProyecto}`
  };

  try {

    const response = await ZOHO.CREATOR.DATA.getRecords(config)
    return response.data

  } catch (error) {
    console.log(error)
    return error
  }

}

const obtenerNivel4 = async (idTrabajo) => {
  const config = {
    app_name: "inventory-1-0",       // tu aplicación
    report_name: "REL_CUENTAS_Report", // tu reporte
    criteria: `TRABAJO == ${idTrabajo}`
  };

  try {
    const response = await ZOHO.CREATOR.DATA.getRecords(config)
    return response.data

  } catch (error) {
    console.log(error)
    return error
  }
}

const obtenerNivel5 = async (idProyecto, idTrabajo, idNivel4) => {
  const config = {
    app_name: "inventory-1-0",       // tu aplicación
    report_name: "REL_CUENTAS_Report", // tu reporte
    criteria: `PROYECTO==${idProyecto} && TRABAJO==${idTrabajo} && NIVEL_4==${idNivel4}`
  };

  try {
    const response = await ZOHO.CREATOR.DATA.getRecords(config)
    return response.data

  } catch (error) {
    console.log(error)
    return error
  }

}

const obtenerIdPresupuesto = async (idProyecto, idTrabajo, idNivel4) => {
  const config = {
    app_name: "inventory-1-0",       // tu aplicación
    report_name: "Reporte_de_presupuestos", // tu reporte
    criteria: `PROYECTO==${idProyecto} && Trabajo==${idTrabajo} && Nivel_4==${idNivel4}`
  };

  try {
    const response = await ZOHO.CREATOR.DATA.getRecords(config)
    return response.data[0].ID

  } catch (error) {
    console.log(error)
    return error
  }
}

const obtenerMaterialesAsociados = async (idPresupuesto) => {
  const config = {
    app_name: "inventory-1-0",       // tu aplicación
    report_name: "MATERIALES_ACTIVIDADES_PRESUPUESTOS_Report", // tu reporte
    criteria: `Presupuesto_Material == ${idPresupuesto}`
  };

  try {
    const response = await ZOHO.CREATOR.DATA.getRecords(config)
    return response.data

  } catch (error) {
    console.log(error)
    return error
  }
}

const vincularMaterial = (codigoMaterial, codigoFamilia) => {
  return codigoMaterial.startsWith(codigoFamilia)
}

/**
 * Renderiza opciones únicas en un <select> a partir de un arreglo de objetos.
 * @param {Array} data - El arreglo con los datos.
 * @param {string} key - La clave dentro de cada objeto (ej. "Trabajo", "Nivel_4").
 * @param {Function} getText - Callback que devuelve el texto que se mostrará en la opción.
 * @param {string} valueField - El campo que será el valor del <option>.
 * @param {string} selectId - El id del <select>.
 */
const eliminarValoresDuplicados = (data, key, getText, valueField, selectId) => {
  const select = document.getElementById(selectId);

  // 🔹 Limpiar y volver a poner opción por defecto
  select.innerHTML = "";
  const defaultOption = new Option("Seleccionar opción", "noValue");
  select.add(defaultOption);

  const valorVisto = new Set();

  data.forEach(item => {
    const obj = item[key];
    if (obj && !valorVisto.has(obj[valueField])) {
      const text = getText(obj); // 🔹 usar callback
      select.add(new Option(text, obj[valueField]));
      valorVisto.add(obj[valueField]);
    }
  });
};

const obtenerMateriales = async (idFamilia) => {
  const config = {
    app_name: "bodega-tabla",       // tu aplicación
    report_name: "MATERIALES_Report", // tu reporte
    // criteria: `id_familia == 4236940000113997139`
    criteria: `id_familia == ${idFamilia}`
  };

  try {
    console.log(idFamilia)
    const response = await ZOHO.CREATOR.DATA.getRecords(config)
    console.log(response.data)
    return response.data

  } catch (error) {
    return error
  }
}

const guardarMateriales = async (idFamilia, object) => {
  object = await obtenerMateriales(idFamilia)
}

// Renderizar materiales en las listas

const renderizarMateriales = async (idFamilia, selectId) => {

  const materiales = await obtenerMateriales(idFamilia)
  const select = document.getElementById(selectId);

  select.innerHTML = "";

  if(materiales.length > 0){
    materiales.forEach(({nombre_material, ID,codigo_material})=>{
      select.add(new Option(`${codigo_material}-${nombre_material}`, ID))
    })
  }else{
    const noDataOption = new Option("No existen materiales para esta familia", "noValue")
    noDataOption.disabled = true
    noDataOption.selected = true
    select.add(noDataOption);
  }

}

// Acciones botón

const agregarMaterial = async(grupos = {}, idNivel5, idNivel8, idFamilia, material, selectId, closeDialog) =>{
  
  const objectFamilia = grupos[idNivel5]["niveles8"][idNivel8]["familias"]
  const objectMateriales = objectFamilia[idFamilia]["materiales"]

  // objectMateriales.push(data)

  const select = document.querySelector(selectId);

  const tr = document.createElement("tr")
  tr.classList.add("hover:bg-gray-50")

  // MATERIALES
  const tdNombreMaterial = document.createElement("td")
  tdNombreMaterial.textContent = "nuevo material..."
  tdNombreMaterial.classList.add("border", "p-2")
  tr.appendChild(tdNombreMaterial)
  
  // UNIDAD
  const tdUnidad = document.createElement("td")
  tdUnidad.textContent = ""
  tdUnidad.classList.add("border", "p-2", "text-center", "text-xs")
  tr.appendChild(tdUnidad)

  // CANT. PRESUP.
  const tdCantidadPresup = document.createElement("td")
  tdCantidadPresup.textContent = ""
  tdCantidadPresup.classList.add("border", "p-2")
  tr.appendChild(tdCantidadPresup)

  // VALOR UNIT.
  const tdValorUnitario = document.createElement("td")
  tdValorUnitario.textContent = ""
  tdValorUnitario.classList.add("border", "p-2")
  tr.appendChild(tdValorUnitario)

  // CANT. A PEDIR
  const tdCantidadAPedir = document.createElement("td")
  tdCantidadAPedir.textContent = ""
  tdCantidadAPedir.classList.add("border", "p-2")
  tr.appendChild(tdCantidadAPedir)

  // TOTAL
  const tdTotal = document.createElement("td")
  tdTotal.textContent = ""
  tdTotal.classList.add("border", "p-2")
  tr.appendChild(tdTotal)

  // ESTADO
  const tdEstado = document.createElement("td")
  tdEstado.textContent = ""
  tdEstado.classList.add("border", "p-2")
  tr.appendChild(tdEstado)

  // ACCIONES
  const tdAcciones = document.createElement("td")
  tdAcciones.textContent = ""
  tdAcciones.classList.add("border", "p-2")
  tr.appendChild(tdAcciones)

  // COMENTARIOS
  const tdComentarios = document.createElement("td")
  tdComentarios.textContent = ""
  tdComentarios.classList.add("border", "p-2")
  tr.appendChild(tdComentarios)

  select.appendChild(tr)

}

(async () => {

  const proyectos = await obtenerProyectosPorUsuario();

  let trabajos = []
  let nivel_4 = []
  let nivel_5 = []
  let idPresupuesto = ""
  let materialesAsociados = []

  const parametros = {
    "proyecto": "",
    "trabajo": "",
    "nivel_4": ""
  }

  proyectos.forEach(async ({ Proyecto }) => {
    document.getElementById("select-proyects").add(new Option(`${Proyecto.HC}-${Proyecto.Proyecto}`, Proyecto.ID))
  });

  // Select Proyecto
  const selectProyectos = document.getElementById("select-proyects")

  selectProyectos.addEventListener("change", async (event) => {
    const value = event.target.value
    parametros.proyecto = value

    trabajos = await obtenerTrabajos(value)

    eliminarValoresDuplicados(trabajos, "TRABAJO", (obj) => `${obj.Nombre_trabajo}`, "ID", "select-trabajos")

  })

  // Select Trabajo
  const selectTrabajos = document.getElementById("select-trabajos")

  selectTrabajos.addEventListener("change", async (event) => {
    const value = event.target.value
    parametros.trabajo = value

    nivel_4 = await obtenerNivel4(value)

    eliminarValoresDuplicados(nivel_4, "NIVEL_4", (obj) => `${obj.codigo_nivel_4}-${obj.nombre_nivel_4}`, "ID", "select-nivel4")

  })

  // Select Nivel-4
  const selectNivel_4 = document.getElementById("select-nivel4")

  selectNivel_4.addEventListener("change", async (event) => {
    const value = event.target.value
    parametros.nivel_4 = value

    nivel_5 = await obtenerNivel5(parametros.proyecto, parametros.trabajo, parametros.nivel_4)

    const selectNiveles = document.getElementById("section-niveles")
    let html = ""

    if (nivel_5.length > 0) {

      idPresupuesto = await obtenerIdPresupuesto(parametros.proyecto, parametros.trabajo, parametros.nivel_4)

      materialesAsociados = await obtenerMaterialesAsociados(idPresupuesto)

      // Agrupar por ID de NIVEL_5
      const grupos = {}
      nivel_5.forEach(({ CANTIDAD, NIVEL_5, NIVEL_8, FAMILIA }) => {
        if (!grupos[NIVEL_5.ID]) {
          grupos[NIVEL_5.ID] = {
            ...NIVEL_5,
            cantidadTotal: 0,
            niveles8: {}
          }
        }

        // grupos[NIVEL_5.ID].cantidadTotal += parseInt(CANTIDAD, 10)

        grupos[NIVEL_5.ID].cantidadTotal = CANTIDAD

        // Agrupación de familias dentro de cada nivel8
        if (!grupos[NIVEL_5.ID].niveles8[NIVEL_8.ID]) {
          grupos[NIVEL_5.ID].niveles8[NIVEL_8.ID] = {
            ...NIVEL_8,
            familias: {}
          }
        }

        //  Agrupación de familias dentro de cada familias
        if (!grupos[NIVEL_5.ID].niveles8[NIVEL_8.ID].familias[FAMILIA.ID]) {
          grupos[NIVEL_5.ID].niveles8[NIVEL_8.ID].familias[FAMILIA.ID] = {
            ...FAMILIA,
            materiales: []
          }
        }

        grupos[NIVEL_5.ID].niveles8[NIVEL_8.ID].familias[FAMILIA.ID]

        materialesAsociados.forEach(({ Materiales, Unitario, Unidades_Totales, Cant_unitaria, Total, Precio, UDM, ID }) => {

          if (vincularMaterial(Materiales.codigo_material, FAMILIA.Codigo_Familia)) {
            grupos[NIVEL_5.ID].niveles8[NIVEL_8.ID].familias[FAMILIA.ID].materiales.push({
              ...Materiales,
              Unitario: Unitario,
              Unidades_Totales: Unidades_Totales,
              Cant_unitaria: Cant_unitaria,
              Total: Total,
              Precio: Precio,
              UDM: UDM,
              ID: ID
            })
          }

        })

      })

      console.log(grupos)

      const materialTest = {
        "IMAGEN_MATERIAL": "",
        "cantidad_por_paquete": "1.00",
        "fondo": "",
        "Niveles_precios_compra": {
          "nombre_nivel_precio_compra": "2-Proveedor/art/nivel de suc",
          "ID": "4236940000098953281",
          "zc_display_value": "2-Proveedor/art/nivel de suc"
        },
        "VOLUMEN": "",
        "CLASIFICACION_LM": {
          "nombre_clasificacion_lm": "IN20-Inven. Pto Propio y Licitación",
          "ID": "4236940000097444003",
          "zc_display_value": "IN20-Inven. Pto Propio y Licitación"
        },
        "Tipo_material": {
          "nombre_tipo_material": "Equipos especiales",
          "ID": "4236940000114739246",
          "zc_display_value": "Equipos especiales"
        },
        "alto": "2.36",
        "ESTADO_MATERIAL": "APROBADO",
        "tipo_paquete": {
          "nombre_tipo_paquete": "Unidad",
          "ID": "4236940000097441087",
          "zc_display_value": "Unidad"
        },
        "diametro_pulgadas": "",
        "precio": "",
        "iva": "19",
        "TIPO_DE_L_NEA1": "S-Stock Inventory Item",
        "MANEJA_VENCIMIENTO": "false",
        "ancho": "1.60",
        "diametro_detalle": "",
        "Added_User": "marval",
        "FICHAS_TECNICAS": [],
        "Estado_lote1": {
          "nombre_estado_lote": "Aprobado",
          "ID": "4236940000097443019",
          "zc_display_value": "Aprobado"
        },
        "ID": "4236940000117005615",
        "nombre_material": "JAULA FUNC DE POTENCIA GSX JFP",
        "sku": "211063",
        "PRECIOS_MATERIALES": [],
        "Regla_costos_adic": {
          "codigo_costos_adicionales": "MAT",
          "ID": "4236940000098953289",
          "zc_display_value": "MAT"
        },
        "UDM": {
          "codigo_udm": "UN",
          "ID": "4236940000097446051",
          "zc_display_value": "UN"
        },
        "Added_Time": "30-Jul-2025 14:48:46",
        "Modified_Time": "16-Sep-2025 09:50:28",
        "peso": "150.00",
        "codigo_material": "211063",
        "Niveles_precios_venta": {
          "nombre_nivel_precio_venta": "2-Sólo artículo sucursal",
          "ID": "4236940000098953277",
          "zc_display_value": "2-Sólo artículo sucursal"
        },
        "Estado_JDE": "",
        "Descripci_n_2": "",
        "Fam_planf_maestra1": {
          "codigo_fam_planf_maestra": "OBR",
          "ID": "4236940000098953285",
          "zc_display_value": "OBR"
        },
        "COMPRAS_GRAVABLES": "Y-Lín sujeta a imptos aplicables",
        "IND_PROD_GR_EMP": "P-Artículo empacado",
        "consecutivo": "",
        "NIveles_costos_inventarios1": {
          "ID": "4236940000098953273",
          "zc_display_value": "2-Sólo artículo sucursal",
          "nombre_nivel_costo_inv": "2-Sólo artículo sucursal"
        },
        "M_T_DE_COMPROMISOS": "1-Ubicación con mayor cantidad",
        "id_familia": {
          "Nombre_Familia": "EQUIPOS ESPECIALES",
          "Codigo_Familia": "21",
          "ID": "4236940000113997139",
          "zc_display_value": "21 - EQUIPOS ESPECIALES"
        },
        "VENTAS_GRAVABLES": "Y-Lín sujeta a imptos aplicables",
        "Verificado_por_compras": "true",
        "tipo_almacen": {
          "ID": "4236940000097442011",
          "nombre_tipo_almacen": "P-Compras materia prima",
          "zc_display_value": "P-Compras materia prima"
        }
      }

      Object.values(grupos).forEach((grupo) => {
        html += `
      <div class="bg-white rounded-lg shadow border">
        <!-- Botón NIVEL 5 -->
        <button class="w-full bg-gray-100 border-l-4 border-blue-500 text-gray-800 p-4 rounded-t-lg cursor-pointer flex items-center justify-between hover:bg-gray-200 accordion-btn">
          <div class="flex items-center gap-3">
            <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold bg-blue-600 text-white border-blue-600 text-sm">
              NIVEL 5
            </div>
            <span class="font-medium text-base">
              ${grupo.codigo_nivel_5}-${grupo.nombre_nivel_5}
            </span>
          </div>
        </button>

        <!-- Contenido NIVEL 5 -->
        <div class="accordion-content hidden bg-gray-50 p-4 rounded-b-lg">
          ${Object.values(grupo.niveles8).map(n8 => `
            <div class="mb-3 border rounded">
              <!-- Botón NIVEL 8 -->
              <button class="w-full flex justify-between items-center px-3 py-2 text-left text-gray-700 border-b subaccordion-btn">
                <div>
                  <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold bg-gray-200 text-sm">NIVEL 8</span>
                  <span class="font-medium text-sm ml-2">${n8.codigo_nivel_8}-${n8.nombre_nivel_8}</span>
                  <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/80 bg-blue-500 text-white border-blue-500 text-sm">
                    APTOS: ${grupo.cantidadTotal}
                  </span>
                </div>
              </button>

              <!-- Contenedor de familias -->
              <div class="subaccordion-content hidden px-3 py-2">
                ${Object.values(n8.familias).map(el => `
                    <!-- Botón FAMILIA -->
                    <button class="w-full family-item bg-blue-50 p-4 mb-2 rounded flex items-center justify-between hover:bg-blue-100 subaccordion-familia-btn" >
                      <div class="flex items-center gap-3">
                        <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold bg-blue-100 text-blue-700 text-xs">
                          FAMILIA
                        </div>
                        <span class="font-medium text-xs">${el.Codigo_Familia}-${el.Nombre_Familia}</span>
                        <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/80 bg-blue-500 text-white border-blue-500 text-sm">
                          APTOS: ${grupo.cantidadTotal}
                        </span>
                      </div>
                    </button>

                    <!-- Contenedor de materiales -->
                    <div class="subaccordion-familia-content hidden p-4">
                      <div class="mb-4">
                      <!-- Botón Agregar Material -->
                        <button id="openDialog-agregar-material-${el.Codigo_Familia}" class="justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 flex items-center gap-2"
                        
                        onclick= " handleModal('dialog-agregar-material-${el.Codigo_Familia}', 'openDialog-agregar-material-${el.Codigo_Familia}', 'closeDialog-agregar-material-${el.Codigo_Familia}' ); renderizarMateriales('${el.ID}', 'select-agregar-materiales-${el.Codigo_Familia}') "

                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus" data-lov-id="src/components/HierarchicalEstimation.tsx:829:50" data-lov-name="Plus" data-component-path="src/components/HierarchicalEstimation.tsx" data-component-line="829" data-component-file="HierarchicalEstimation.tsx" data-component-name="Plus" data-component-content="%7B%7D"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                          Agregar Material
                        </button>

                        <!-- Modal Agregar Material -->
                        <dialog id="dialog-agregar-material-${el.Codigo_Familia}" class="p-6 rounded-lg shadow-lg border bg-white max-w-lg w-full">
                          
                        <div class="flex flex-col mb-4 text-center sm:text-left">
                          <h2 class="text-lg font-semibold leading-none tracking-tight">Agregar Material</h2>
                        </div>

                        <div class="mb-4">
                          <select class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1" name="" id="select-agregar-materiales-${el.Codigo_Familia}" >
                              
                          </select>
                          <button class="mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-blue-500 text-primary-foreground h-10 px-4 py-2 w-full text-white"
                          
                          onclick = 'agregarMaterial( ${JSON.stringify(grupos)}, "${grupo.ID}", "${n8.ID}", "${el.ID}", ${JSON.stringify(materialTest)}, "#table-${el.ID} tbody") '
                          
                          >Agregar</button>
                        </div>

                        <button type="button" id="closeDialog-agregar-material-${el.Codigo_Familia}" class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none" >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-4 w-4" data-lov-id="src/components/ui/dialog.tsx:46:8" data-lov-name="X" data-component-path="src/components/ui/dialog.tsx" data-component-line="46" data-component-file="dialog.tsx" data-component-name="X" data-component-content="%7B%22className%22%3A%22h-4%20w-4%22%7D"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                        </button>

                        </dialog>

                      </div>

                      ${el.materiales.length > 0 ? `

                        <!-- Tabla Materiales -->
                        <div class="overflow-x-auto">
                          <table id="table-${el.ID}" class="w-full border-collapse">
                            <thead class="">
                              <tr>
                                <th class="border p-2 text-left text-xs font-medium text-gray-700">MATERIALES</th>
                                <th class="border p-2 text-left text-xs font-medium text-gray-700">UNIDAD</th>
                                <th class="border p-2 text-left text-xs font-medium text-gray-700">CANT. PRESUP.</th>
                                <th class="border p-2 text-left text-xs font-medium text-gray-700">VALOR UNIT.</th>
                                <th class="border p-2 text-left text-xs font-medium text-gray-700">CANT. A PEDIR</th>
                                <th class="border p-2 text-left text-xs font-medium text-gray-700">TOTAL</th>
                                <th class="border p-2 text-left text-xs font-medium text-gray-700">ESTADO</th>
                                <th class="border p-2 text-left text-xs font-medium text-gray-700">ACCIONES</th>
                                <th class="border p-2 text-left text-xs font-medium text-gray-700">COMENTARIOS</th>
                              </tr>
                            </thead>
                            <tbody>
                                ${el.materiales.map((material) => `

                                    <tr class="hover:bg-gray-50">
        <td class="border p-2">${material.codigo_material}-${material.nombre_material}</td>
        <td class="border p-2 text-center text-xs">${material.UDM.codigo_udm}</td>
        <td class="border p-2 text-center text-xs">${material.Cant_unitaria}</td>
        <td class="border p-2 text-center text-xs">$${material.Unitario}</td>
        <td class="border p-2 text-center">
          <!-- CANT. A PEDIR -->
          <input value=${material.Cant_unitaria} type="number" class="flex h-10 rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-24 text-center text-[9px]"></input>
        </td>
        <td class="border p-2 text-center font-semibold text-blue-600 text-xs">$${material.Total}</td>
        <td class="border p-2 text-center">
          <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80" style="background-color: rgb(251, 191, 36); color: rgb(0, 0, 0);">
            Estado
          </span>
        </td>
        <td class="border p-2 text-center">
<!-- ACCIONES -->

<button id="openDialog-sustituir-material-${material.codigo_material}" class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md text-xs px-2 py-1" 

onclick= " handleModal('dialog-sustituir-material-${material.codigo_material}', 'openDialog-sustituir-material-${material.codigo_material}', 'closeDialog-sustituir-material-${material.codigo_material}' ); renderizarMateriales('${el.ID}', 'select-sustituir-materiales-${el.Codigo_Familia}') "

>
  Sustituir
</button>

<!-- Modal Sustituir Material -->
<dialog id="dialog-sustituir-material-${material.codigo_material}" class="p-6 rounded-lg shadow-lg border bg-white max-w-lg w-full" >
  
<div class="flex flex-col mb-4 text-center sm:text-left">
  <h2 class="text-lg font-semibold leading-none tracking-tight">Sustituir Material</h2>
</div>

<div class="mb-4">
  <select class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1" name="" id="select-sustituir-materiales-${el.Codigo_Familia}" >
  </select>
</div>

<button type="button" id="closeDialog-sustituir-material-${material.codigo_material}" class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none" >
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-4 w-4" data-lov-id="src/components/ui/dialog.tsx:46:8" data-lov-name="X" data-component-path="src/components/ui/dialog.tsx" data-component-line="46" data-component-file="dialog.tsx" data-component-name="X" data-component-content="%7B%22className%22%3A%22h-4%20w-4%22%7D"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
</button>

</dialog>

        </td>
        <td class="border p-2 text-center">
          <input class="flex h-10 rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-24 text-xs" placeholder="Comentario..."></input>
        </td>
      </tr>

                                  ` ).join("")
            }
                            </tbody>
                          </table>
                        </div>
                        
                        ` : `<span>No hay materiales asociados</<span>`
          }

                    </div>

                `).join("")}
              </div>
            </div>

          `).join("")}
        </div>
      </div>
      `
      })

      selectNiveles.innerHTML = html

      // Activo acordeones
      acordeonPrincipal(".accordion-btn")
      acordeonPrincipal(".subaccordion-btn")
      acordeonPrincipal(".subaccordion-familia-btn")

      // Modales
      // document.getElementById("openDialog-agregar-material").addEventListener("click", () =>{
      //   console.log("Modal...")
      //   handleModal("dialog-agregar-material", "openDialog-agregar-material", "closeDialog-agregar-material")
      // })

    }
  })

})();