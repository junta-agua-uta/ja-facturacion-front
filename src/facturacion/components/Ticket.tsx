import React from 'react';
import { FacturaForm as FacturaFormType } from '../../shared/components/interfaces/factura.interface';

interface PrintPreviewModalProps {
  isOpen: boolean;
  formData: FacturaFormType;
  total?: number;  // Agregar esta línea
  onClose: () => void;
  onPrint: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  formData,
  total = 0,
  onClose,
  onPrint
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Factura - ${formData.numero}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  background: white; 
                }
                .print-container {
                  max-width: 400px;
                  margin: 0 auto;
                  padding: 20px;
                  border: 2px solid #333;
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .title {
                  font-size: 18px;
                  font-weight: bold;
                  color: #2563eb;
                  margin-bottom: 10px;
                }
                .subtitle {
                  font-size: 14px;
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 8px;
                  font-size: 12px;
                }
                .info-label {
                  font-weight: bold;
                }
                .table-section {
                  margin-top: 20px;
                }
                .table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 11px;
                }
                .table th, .table td {
                  border: 1px solid #333;
                  padding: 5px;
                  text-align: center;
                }
                .table th {
                  background-color: #2563eb;
                  color: white;
                  font-weight: bold;
                }
                .total-section {
                  margin-top: 10px;
                  text-align: right;
                }
                .total-box {
                  display: inline-block;
                  border: 1px solid #333;
                  padding: 5px 10px;
                  background-color: #2563eb;
                  color: white;
                  font-weight: bold;
                  font-size: 12px;
                }
                @media print {
                  body { margin: 0; }
                  .print-container { border: none; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
    onPrint();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Vista Previa - Contenido de la Imprimir</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Contenido para imprimir */}
        <div className="p-6">
          <div id="print-content">
            <div className="print-container max-w-md mx-auto p-6 border-2 border-gray-800 bg-white">
              {/* Header */}
              <div className="header text-center mb-6">
                <div className="title text-lg font-bold text-blue-600 mb-2">
                  Contenido de la Imprimir
                </div>
                <div className="subtitle text-sm font-bold mb-4">
                  JUNTA<br />
                  ADMINISTRADORA DE<br />
                  AGUA POTABLE
                </div>
              </div>

              {/* Información de la factura */}
              <div className="space-y-2 text-xs">
                <div className="info-row flex justify-between">
                  {/* <span className="info-label font-bold">"San Vicente Yaculoma y Bellavista El Rosario"</span> */}
                </div>
                
                <div className="info-row flex justify-between">
                  <span className="info-label font-bold">Serie:</span>
                  <span>{formData.serie || '001'}</span>
                </div>
                
                <div className="info-row flex justify-between">
                  <span className="info-label font-bold">Numero:</span>
                  <span>{formData.numero || '300'}</span>
                </div>
                
                <div className="info-row flex justify-between">
                  <span className="info-label font-bold">Secuencia:</span>
                  <span>{formData.secuencia || '000001219'}</span>
                </div>
                
                <div className="info-row flex justify-between">
                  <span className="info-label font-bold">Concepto:</span>
                  <span>{formData.concepto || '-'}</span>
                </div>
                
                <div className="info-row flex justify-between">
                  <span className="info-label font-bold">C.I./RUC:</span>
                  <span>{formData.cedula || '1803058393'}</span>
                </div>
                
                <div className="info-row flex justify-between">
                  <span className="info-label font-bold">Cliente:</span>
                  <span>{formData.cliente || '-'}</span>
                </div>
                
                <div className="info-row flex justify-between">
                  <span className="info-label font-bold">Emisión:</span>
                  <span>{formData.emision || '2025-05-19'}</span>
                </div>
                
                <div className="info-row flex justify-between">
                  <span className="info-label font-bold">Vence:</span>
                  <span>{formData.vencimiento || '2025-05-21'}</span>
                </div>
              </div>

              {/* Tabla de consumo */}
              <div className="table-section mt-6">
                <table className="table w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-800 bg-blue-600 text-white p-1">
                        Total: ${total.toFixed(2)}
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del modal con botones */}
        <div className="flex justify-end gap-4 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};