import { useEffect, useState } from "react";
import { Title, EndSlot, CardSlot } from "../../shared/components";
import AddConceptoModal from "../modals/AddConceptoModal";
import { ConfirmModal } from "../modals";
import { Concepto, ConceptoFilter, generarCodigos } from "../types/concepto";
import { ConceptosTable, ConceptoFilters } from "../components";
import { conceptosService } from "../services";
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

  // Estado para edición
  const [editingConcepto, setEditingConcepto] = useState<Concepto>({
    id: "",
    codigo: "",
    codInterno: "",
    desc: "",
    precioBase: undefined,
    requiereMes: false,
  });
  const [isEditing, setIsEditing] = useState(false);

  // Estado para filtros de búsqueda
  const [filters, setFilters] = useState<ConceptoFilter>({});

  // Estado para el modal de confirmación
  const [conceptoToDelete, setConceptoToDelete] = useState<Concepto | null>(null);

  // Cargar conceptos desde API
  useEffect(() => {
    const fetchConceptos = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Si hay filtros activos, usar la búsqueda con filtros
        const hasActiveFilters = filters.desc || filters.codigo;
        
        console.log("🔍 Estado de filtros:", filters);
        console.log("🔍 Hay filtros activos:", hasActiveFilters);
        
        const result = hasActiveFilters 
          ? await conceptosService.buscarConFiltros(filters, currentPage, PAGE_SIZE)
          : await conceptosService.listar(currentPage, PAGE_SIZE);
        
        console.log("📊 Resultado obtenido:", result);

        setConceptos(result.data);
        setTotalItems(result.totalItems);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error("Error fetching conceptos:", err);
        setError(err instanceof Error ? err.message : "No se pudo cargar la lista de conceptos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConceptos();
  }, [currentPage, filters]);


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

      // Guardar en la base de datos usando el servicio
      const added = await conceptosService.crear(payload);

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

      (document.getElementById("concepto_modal") as HTMLDialogElement)?.close();
  } catch (err) {
    console.error("Error adding concepto:", err);
      setError(err instanceof Error ? err.message : "No se pudo agregar el concepto");
    } finally {
      setIsLoading(false);
    }
  };

  // Editar concepto
  const handleEditConcepto = (concepto: Concepto) => {
    console.log("Editar concepto:", concepto);
    setEditingConcepto(concepto);
    setIsEditing(true);
    const dialog = document.getElementById("concepto_modal") as HTMLDialogElement;
    dialog?.showModal();
  };

  // Guardar cambios de edición
  const handleUpdateConcepto = async () => {
    if (!editingConcepto.desc) {
      setError("La descripción es obligatoria");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Preparar objeto a enviar a la API (sin generar nuevos códigos)
      const payload = {
        codigo: editingConcepto.codigo,
        codInterno: editingConcepto.codInterno,
        desc: editingConcepto.desc,
        precioBase: editingConcepto.precioBase,
        requiereMes: editingConcepto.requiereMes,
      };
      console.log("Payload to update:", payload);

      // Actualizar en la base de datos usando el servicio
      const updated = await conceptosService.actualizar(editingConcepto.id, payload);

      // Actualizar en el estado local
      setConceptos(prev => prev.map(c => c.id === editingConcepto.id ? updated : c));

      // Limpiar estado de edición
      setEditingConcepto({
        id: "",
        codigo: "",
        codInterno: "",
        desc: "",
        precioBase: undefined,
        requiereMes: false,
      });
      setIsEditing(false);

      (document.getElementById("concepto_modal") as HTMLDialogElement)?.close();
    } catch (err) {
      console.error("Error updating concepto:", err);
      setError(err instanceof Error ? err.message : "No se pudo actualizar el concepto");
  } finally {
    setIsLoading(false);
  }
};

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingConcepto({
      id: "",
      codigo: "",
      codInterno: "",
      desc: "",
      precioBase: undefined,
      requiereMes: false,
    });
    setIsEditing(false);
  };

  // Manejar cambios en filtros
  const handleFiltersChange = (newFilters: ConceptoFilter) => {
    console.log("🔄 Cambio de filtros:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Resetear a la primera página cuando se cambian los filtros
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    console.log("🧹 Limpiando filtros");
    setFilters({});
    setCurrentPage(1);
  };

  // Desactivar concepto (eliminado lógico)
  const handleDelete = async () => {
    if (conceptoToDelete) {
      setIsLoading(true);
      setError(null);
      try {
        await conceptosService.desactivar(conceptoToDelete.id);
        setConceptos(prev => prev.filter(c => c.id !== conceptoToDelete.id));
        setConceptoToDelete(null);
        (document.getElementById('delete_modal') as HTMLDialogElement)?.close();
      } catch (error) {
        console.error('Error deactivating concepto:', error);
        setError('No se pudo desactivar el concepto');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Eliminar concepto - COMENTADO TEMPORALMENTE
  // const handleDeleteConcepto = async (id: string) => {
  //   if (confirm("¿Estás seguro de que deseas eliminar este concepto?")) {
  //     try {
  //       await conceptosService.eliminar(id);
  //       setConceptos(prev => prev.filter(c => c.id !== id));
  //       console.log("Concepto eliminado:", id);
  //     } catch (err) {
  //       console.error("Error deleting concepto:", err);
  //       setError(err instanceof Error ? err.message : "No se pudo eliminar el concepto");
  //     }
  // }
  // };


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
              setIsEditing(false);
              const dialog = document.getElementById("concepto_modal") as HTMLDialogElement;
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

        {/* Filtros de búsqueda */}
        <ConceptoFilters
          filters={filters}
          onChange={handleFiltersChange}
          onClear={handleClearFilters}
        />

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
            onEdit={handleEditConcepto}
            onDelete={(conceptoId) => {
              const concepto = conceptos.find(c => c.id === conceptoId);
              setConceptoToDelete(concepto ?? null);
              (document.getElementById('delete_modal') as HTMLDialogElement)?.showModal();
            }}
            onPageChange={setCurrentPage}
          />
        )}
      </CardSlot>

      <AddConceptoModal
        id="concepto_modal"
        concepto={isEditing ? editingConcepto : newConcepto}
        onChange={isEditing ? setEditingConcepto : setNewConcepto}
        onCancel={() => {
          if (isEditing) {
            handleCancelEdit();
          } else {
          setNewConcepto({
            id: "",
            codigo: "",
            codInterno: "",
            desc: "",
            precioBase: undefined,
            requiereMes: false,
            });
        }
        }}
        onSave={isEditing ? handleUpdateConcepto : handleAddConcepto}
        isEditing={isEditing}
      />

      <ConfirmModal
        id="delete_modal"
        title="Confirmar desactivación"
        message={`¿Estás seguro de que deseas desactivar el concepto "${conceptoToDelete?.desc}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConceptoToDelete(null)}
      />
    </>
  );
}
