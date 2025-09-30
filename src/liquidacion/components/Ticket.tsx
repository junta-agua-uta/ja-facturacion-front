import React from 'react';
import { LiquidacionForm as LiquidacionFormType, LiquidacionItem } from '../../shared/components/interfaces/liquidacion.interface';

interface PrintPreviewModalProps {
  isOpen: boolean;
  formData: LiquidacionFormType;
  total?: number;
  onClose: () => void;
  onPrint: () => void;
  showVencimiento?: boolean;
}

const formatCurrency = (n?: number | string) =>
  typeof n === 'number' ? n.toFixed(2) : n ? Number(n).toFixed(2) : '0.00';

const formatDate = (date?: string) => {
  if (!date) return '-';
  const d = new Date(date);
  return isNaN(d.getTime()) ? date : d.toLocaleDateString('es-EC');
};

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  formData,
  total = 0,
  onClose,
  onPrint,
  showVencimiento = true
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('print-content');
    if (!printContent) return onPrint();

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return onPrint();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Liquidación - ${formData.numero || formData.secuencia || '000'}</title>
          <meta charset="UTF-8">
          <style>
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              line-height: 1.2;
              color: #000; 
              background: white;
              padding: 10px;
            }
            .ticket { 
              max-width: 300px; 
              margin: 0 auto;
              border: 1px dashed #666;
              padding: 15px;
              position: relative;
            }
            .header { 
              text-align: center; 
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #333;
            }
            .organization {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            .document-type {
              font-size: 11px;
              color: #666;
              margin-bottom: 8px;
            }
            .separator {
              border-top: 1px dashed #333;
              margin: 8px 0;
            }
            .double-separator {
              border-top: 2px double #333;
              margin: 10px 0;
            }
            .info-section {
              margin-bottom: 12px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
            }
            .info-label {
              font-weight: bold;
              min-width: 80px;
            }
            .info-value {
              text-align: right;
              flex: 1;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
              font-size: 10px;
            }
            .items-table th {
              border-bottom: 1px solid #333;
              padding: 4px 2px;
              text-align: left;
              font-weight: bold;
            }
            .items-table td {
              padding: 3px 2px;
              border-bottom: 1px dotted #ccc;
            }
            .total-section {
              text-align: center;
              margin: 15px 0;
              padding: 8px;
              border: 1px solid #000;
              background: #f0f0f0;
            }
            .total-amount {
              font-size: 16px;
              font-weight: bold;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px dashed #333;
              font-size: 10px;
              color: #666;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 40px;
              color: rgba(0,0,0,0.1);
              pointer-events: none;
              z-index: -1;
              white-space: nowrap;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .ticket { border: none; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="watermark">LIQUIDACIÓN</div>
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
      onPrint();
    };
  };

  const displayTotal = total || formData.total || 0;
  const items: LiquidacionItem[] = formData.items || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-gray-50 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Vista Previa de Liquidación</h2>
            <p className="text-sm text-gray-600 mt-1">
              {formData.numero || formData.secuencia ? `Documento: ${formData.numero || formData.secuencia}` : 'Nuevo documento'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-3xl font-light bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm hover:shadow transition-all"
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-8 max-w-md mx-auto">
            <div id="print-content" className="text-center">
              
              {/* Encabezado Mejorado */}
              <div className="header mb-6">
                <div className="organization text-lg font-bold text-gray-900 leading-tight mb-2">
                  JUNTA ADMINISTRADORA<br />
                  DE AGUA POTABLE
                </div>
                <div className="document-type text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">
                  COMPROBANTE DE LIQUIDACIÓN
                </div>
                <div className="separator"></div>
              </div>

              {/* Información Principal - Mejor Estructurada */}
              <div className="info-section space-y-3 text-sm">
                <div className="info-row">
                  <span className="info-label text-gray-700">Serie/Número:</span>
                  <span className="info-value text-gray-900 font-medium">
                    {[formData.serie, formData.numero].filter(Boolean).join('-') || '-'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label text-gray-700">Secuencia:</span>
                  <span className="info-value text-gray-900 font-medium">{formData.secuencia || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label text-gray-700">C.I./RUC:</span>
                  <span className="info-value text-gray-900 font-medium">{formData.cedula || formData.rucComprador || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label text-gray-700">Cliente:</span>
                  <span className="info-value text-gray-900 font-medium">{formData.cliente || formData.nombre || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label text-gray-700">Concepto:</span>
                  <span className="info-value text-gray-900 font-medium">{formData.concepto || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label text-gray-700">Emisión:</span>
                  <span className="info-value text-gray-900 font-medium">{formatDate(formData.emision)}</span>
                </div>
                {showVencimiento && (
                  <div className="info-row">
                    <span className="info-label text-gray-700">Vencimiento:</span>
                    <span className="info-value text-gray-900 font-medium">{formatDate(formData.vencimiento)}</span>
                  </div>
                )}
              </div>

              <div className="double-separator my-6"></div>

              {/* Total Destacado */}
              <div className="total-section bg-gradient-to-r from-blue-50 to-gray-50 border-2 border-blue-200 rounded-lg py-4 px-6 mb-6">
                <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  TOTAL A PAGAR
                </div>
                <div className="total-amount text-2xl font-bold text-blue-600 mt-2">
                  $ {formatCurrency(displayTotal)}
                </div>
              </div>

              {/* Pie de Página Mejorado */}
              <div className="footer text-xs text-gray-500 space-y-1">
                <div className="font-medium">¡Gracias por su preferencia!</div>
                <div>Documento generado el {new Date().toLocaleDateString('es-EC')}</div>
              </div>

            </div>
          </div>

          
        </div>

        {/* Footer con acciones */}
        <div className="flex justify-between items-center p-6 border-t bg-white rounded-b-xl">
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold text-green-600">$ {formatCurrency(displayTotal)}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
            >
              <span>✕</span>
              Cancelar
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
            >
              
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};