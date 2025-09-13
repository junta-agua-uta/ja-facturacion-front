import { useEffect, useState } from "react";
import api from "../../shared/api";
import { Title, EndSlot, CardSlot } from "../../shared/components";
import AddConceptoModal from "../modals/AddConceptoModal";
import { Concepto, generarCodigos } from "../types/concepto";
import ConceptosTable from "../components/ConceptosTable";
import { PAGE_SIZE } from '../../shared/utils/constants';

interface ApiConcepto {
  ID: number;
  CODIGO: string;
  COD_INTERNO: string;
  DESCRIPCION: string;
  PRECIO_BASE: number;
  REQUIERE_MES: boolean;
}

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
        const response = await api.get("/conceptos");
        const data: ApiConcepto[] = response.data;
        const mapped = data.map((c) => ({
          id: c.ID.toString(),
          codigo: c.CODIGO,
          codInterno: c.COD_INTERNO,
          desc: c.DESCRIPCION,
          precioBase: c.PRECIO_BASE,
          requiereMes: c.REQUIERE_MES,
        }));
        setConceptos(mapped);
      } catch (err) {
        console.error("Error fetching conceptos:", err);
        setError("No se pudo cargar la lista de conceptos");
      } finally {
        setIsLoading(false);
      }
    };
    fetchConceptos();
  }, []);

  // Agregar concepto
  // const handleAddConcepto = async () => {
  //   if (!newConcepto.codigo || !newConcepto.codInterno || !newConcepto.desc) return;

  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     const response = await api.post("/conceptos", {
  //       codigo: newConcepto.codigo,
  //       codInterno: newConcepto.codInterno,
  //       descripcion: newConcepto.desc,
  //       precioBase: newConcepto.precioBase,
  //       requiereMes: newConcepto.requiereMes,
  //     });

  //     const added = response.data;
  //     const conceptoObj: Concepto = {
  //       id: added.ID.toString(),
  //       codigo: added.CODIGO,
  //       codInterno: added.COD_INTERNO,
  //       desc: added.DESCRIPCION,
  //       precioBase: added.PRECIO_BASE,
  //       requiereMes: added.REQUIERE_MES,
  //     };

  //     setConceptos((prev) => [...prev, conceptoObj]);
  //     setNewConcepto({
  //       id: "",
  //       codigo: "",
  //       codInterno: "",
  //       desc: "",
  //       precioBase: 0,
  //       requiereMes: false,
  //     });

  //     (document.getElementById("add_modal") as HTMLDialogElement)?.close();
  //   } catch (err) {
  //     console.error("Error adding concepto:", err);
  //     setError("No se pudo agregar el concepto");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleAddConcepto = () => {
    // Generar código y código interno en base a la descripción
    const { codigo, codInterno } = generarCodigos(
      newConcepto.desc,
      conceptos.map(c => c.codInterno) // comprobamos codigos existentes
    );

    // Crear un objeto concepto completo
    const conceptoPrueba: Concepto = {
      ...newConcepto,
      codigo,
      codInterno,
    };

    // Mostrar en consola para probar
    console.log("Concepto que se guardaría:", conceptoPrueba);

    // Opcional: agregarlo localmente para ver cómo se ve en la tabla sin enviar a la API
    setConceptos(prev => [...prev, conceptoPrueba]);

    // Limpiar el modal
    setNewConcepto({
      id: "",
      codigo: "",
      codInterno: "",
      desc: "",
      precioBase: undefined,
      requiereMes: false,
    });

    (document.getElementById("add_modal") as HTMLDialogElement)?.close();
  };



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
