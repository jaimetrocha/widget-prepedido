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

  console.log("hola")

  const dialog = document.getElementById(idDialog)
  const openButton = document.getElementById(openDialog)
  const closeButton = document.getElementById(closeDialog)

  // openButton.addEventListener("click", () => {
  //   dialog.showModal()
  // })

  // closeButton.addEventListener("click", () => {
  //   dialog.close()
  // })

  dialog.showModal();

  if(closeButton){
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

const obtenerMateriales = async (idPresupuesto) => {
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

(async () => {

  const proyectos = await obtenerProyectosPorUsuario();
  let trabajos = []
  let nivel_4 = []
  let nivel_5 = []
  let idPresupuesto = ""
  let materiales = []

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
      console.log(nivel_5)

      idPresupuesto = await obtenerIdPresupuesto(parametros.proyecto, parametros.trabajo, parametros.nivel_4)

      materiales = await obtenerMateriales(idPresupuesto)

      console.log(materiales)

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

        materiales.forEach(({ Materiales, Unitario, Unidades_Totales, Cant_unitaria, Total, Precio, UDM, ID }) => {

          if (vincularMaterial(Materiales.codigo_material, FAMILIA.Codigo_Familia)) {
            grupos[NIVEL_5.ID].niveles8[NIVEL_8.ID].familias[FAMILIA.ID].materiales.push({
              ...Materiales,
              Unitario:Unitario, 
              Unidades_Totales:Unidades_Totales, 
              Cant_unitaria:Cant_unitaria, 
              Total:Total, 
              Precio:Precio, 
              UDM:UDM, 
              ID:ID
            })
          }

        })

      })

      console.log(grupos)

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
                    <button class="w-full family-item bg-blue-50 p-4 mb-2 rounded flex items-center justify-between hover:bg-blue-100 subaccordion-familia-btn">
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
                        
                        onclick= " handleModal('dialog-agregar-material-${el.Codigo_Familia}', 'openDialog-agregar-material-${el.Codigo_Familia}', 'closeDialog-agregar-material-${el.Codigo_Familia}' ) "

                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus" data-lov-id="src/components/HierarchicalEstimation.tsx:829:50" data-lov-name="Plus" data-component-path="src/components/HierarchicalEstimation.tsx" data-component-line="829" data-component-file="HierarchicalEstimation.tsx" data-component-name="Plus" data-component-content="%7B%7D"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                          Agregar Material
                        </button>

                        <!-- Modal Agregar Material -->
                        <dialog id="dialog-agregar-material-${el.Codigo_Familia}" class="p-6 rounded-lg shadow-lg border bg-white max-w-lg w-full" >
                          
                        <div class="flex flex-col mb-4 text-center sm:text-left">
                          <h2 class="text-lg font-semibold leading-none tracking-tight">Agregar Material</h2>
                        </div>

                        <div class="mb-4">
                          <select class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1" name="" id="">
                            <option value="">X1</option>
                          </select>
                        </div>

                        <button type="button" id="closeDialog-agregar-material-${el.Codigo_Familia}" class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none" >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-4 w-4" data-lov-id="src/components/ui/dialog.tsx:46:8" data-lov-name="X" data-component-path="src/components/ui/dialog.tsx" data-component-line="46" data-component-file="dialog.tsx" data-component-name="X" data-component-content="%7B%22className%22%3A%22h-4%20w-4%22%7D"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                        </button>

                        </dialog>

                      </div>

                      ${
                        el.materiales.length > 0 ? `

                        <!-- Tabla Materiales -->
                        <div class="overflow-x-auto">
                          <table class="w-full border-collapse">
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
                                ${
                                  el.materiales.map( (materiales) => `

                                    <tr class="hover:bg-gray-50">
        <td class="border p-2">${materiales.codigo_material}-${materiales.nombre_material}</td>
        <td class="border p-2 text-center text-xs">${materiales.UDM.codigo_udm}</td>
        <td class="border p-2 text-center text-xs">${materiales.Cant_unitaria}</td>
        <td class="border p-2 text-center text-xs">$${materiales.Unitario}</td>
        <td class="border p-2 text-center">
          <!-- CANT. A PEDIR -->
          <input value=${materiales.Cant_unitaria} type="number" class="flex h-10 rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-24 text-center text-[9px]"></input>
        </td>
        <td class="border p-2 text-center font-semibold text-blue-600 text-xs">$${materiales.Total}</td>
        <td class="border p-2 text-center">
          <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80" style="background-color: rgb(251, 191, 36); color: rgb(0, 0, 0);">
            Estado
          </span>
        </td>
        <td class="border p-2 text-center">
          <!-- ACCIONES -->
          <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md text-xs px-2 py-1" >
                                  Sustituir
                                </button>
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