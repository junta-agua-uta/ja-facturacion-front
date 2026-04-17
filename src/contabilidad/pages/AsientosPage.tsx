import { useSearchParams } from 'react-router-dom';
import Title from '../../shared/components/Title';

export default function AsientosPage() {
  const [searchParams] = useSearchParams();
  const periodoId = searchParams.get('periodoId');

  return (
    <div className="space-y-4">
      <Title title="Asientos" />
      {periodoId ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          <p className="font-medium text-gray-900">Asientos del periodo seleccionado</p>
          <p className="mt-1 leading-relaxed">
            Estás viendo el módulo en el contexto de este periodo. Aquí se mostrará el listado de asientos cuando esté disponible en pantalla.
          </p>
        </div>
      ) : (
        <p className="text-gray-600 text-sm">Contenido pendiente.</p>
      )}
    </div>
  );
}
