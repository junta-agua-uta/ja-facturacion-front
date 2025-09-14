import { useEffect, useState } from "react";
import api from "../../shared/api";
import { Title, EndSlot, CardSlot } from "../../shared/components";
import AddConceptoModal from "../modals/AddConceptoModal";
import { Concepto, generarCodigos } from "../types/concepto";
import ConceptosTable from "../components/ConceptosTable";
import { PAGE_SIZE } from '../../shared/utils/constants';



export default function ConceptosPage() {
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); //
  const [totalItems, setTotalItems] = useState(0); //
  const [totalPages, setTotalPages] = useState(1); //

  // Estado inicial según la nueva interfaz Concepto
  const [newConcepto, setNewConcepto] = useState<Concepto>({
    id: "",
    codigo: "",
    codInterno: "",
    desc: "",
    precioBase: undefined,
    requiereMes: false,
  });

  // Cargar conceptos desde API
  useEffect(() => {
    const fetchConceptos = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get("/conceptos", {
          params: { page: currentPage, limit: PAGE_SIZE }
        });

        console.log(response.data);

        // Usar los datos ya mapeados desde el backend
        const dataArray: Concepto[] = response.data.data || [];
        setConceptos(dataArray);

        setTotalItems(response.data.totalItems || 0);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching conceptos:", err);
        setError("No se pudo cargar la lista de conceptos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConceptos();
  }, [currentPage]);


  // Agregar concepto
 const handleAddConcepto = async () => {
  if (!newConcepto.desc) {
    setError("La descripción es obligatoria");
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    // Generar código y código interno automáticamente
    const { codigo, codInterno } = generarCodigos(
      newConcepto.desc,
      conceptos.map(c => c.codInterno) // comprobamos códigos existentes
    );

    // Preparar objeto a enviar a la API
    const payload = {
      codigo,
      codInterno,
      desc: newConcepto.desc,
      precioBase: newConcepto.precioBase,
      requiereMes: newConcepto.requiereMes,
    };
    console.log("Payload to send:", payload);

    // Guardar en la base de datos
    const added: Concepto = await api.post("/conceptos", payload).then(res => res.data);

    // Ya viene mapeado desde el backend, solo agregar al estado
    setConceptos(prev => [...prev, added]);

    // Limpiar modal
    setNewConcepto({
      id: "",
      codigo: "",
      codInterno: "",
      desc: "",
      precioBase: undefined,
      requiereMes: false,
    });

    (document.getElementById("add_modal") as HTMLDialogElement)?.close();
  } catch (err) {
    console.error("Error adding concepto:", err);
    setError("No se pudo agregar el concepto");
  } finally {
    setIsLoading(false);
  }
};


  // const handleAddConcepto = () => {
  //   // Generar código y código interno en base a la descripción
  //   const { codigo, codInterno } = generarCodigos(
  //     newConcepto.desc,
  //     conceptos.map(c => c.codInterno) // comprobamos codigos existentes
  //   );

  //   // Crear un objeto concepto completo
  //   const conceptoPrueba: Concepto = {
  //     ...newConcepto,
  //     codigo,
  //     codInterno,
  //   };

  //   // Mostrar en consola para probar
  //   console.log("Concepto que se guardaría:", conceptoPrueba);

  //   // Opcional: agregarlo localmente para ver cómo se ve en la tabla sin enviar a la API
  //   setConceptos(prev => [...prev, conceptoPrueba]);

  //   // Limpiar el modal
  //   setNewConcepto({
  //     id: "",
  //     codigo: "",
  //     codInterno: "",
  //     desc: "",
  //     precioBase: undefined,
  //     requiereMes: false,
  //   });

  //   (document.getElementById("add_modal") as HTMLDialogElement)?.close();
  // };



  return (
    <>
      <Title title="Conceptos de Facturación" />

      <CardSlot>
        <EndSlot>
          <button
            className="btn btn-primary"
            onClick={() => {
              const dialog = document.getElementById("add_modal") as HTMLDialogElement;
              dialog?.showModal();
            }}
          >
            Agregar concepto
          </button>
        </EndSlot>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <ConceptosTable
            data={conceptos}
            pagination={{
              currentPage,
              totalPages,
              pageSize: PAGE_SIZE,
              totalItems,
            }}
            // onEdit={handleEditConcepto}
            //onDelete={handleDeleteConcepto}
            onPageChange={setCurrentPage}
          />
        )}
      </CardSlot>

      <AddConceptoModal
        id="add_modal"
        concepto={newConcepto}
        onChange={setNewConcepto}
        onCancel={() =>
          setNewConcepto({
            id: "",
            codigo: "",
            codInterno: "",
            desc: "",
            precioBase: undefined,
            requiereMes: false,
          })
        }
        onSave={handleAddConcepto}
      />
    </>
  );
}
