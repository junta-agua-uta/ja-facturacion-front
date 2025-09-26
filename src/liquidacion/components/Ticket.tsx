import React from 'react';
import { LiquidacionForm as LiquidacionFormType } from '../../shared/components/interfaces/liquidacion.interface';

interface PrintPreviewModalProps {
  isOpen: boolean;
  formData: LiquidacionFormType;
  total?: number;
  onClose: () => void;
  onPrint: () => void;
  showVencimiento?: boolean;
}

const formatCurrency = (n?: number) =>
  typeof n === 'number' ? n.toFixed(2) : (n ? String(n) : '0.00');

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
    if (!printContent) {
      onPrint();
      return;
    }

    const ticketNumber = formData.numero || formData.secuencia || `${Date.now()}`;
    const printWindow = window.open('', '_blank', 'toolbar=0,location=0,menubar=0');
    if (!printWindow) {
      onPrint();
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Liquidación-${ticketNumber}</title>
          <style>
            * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
            body { font-family: Arial, Helvetica, sans-serif; color: #000; margin: 10px; }
            .ticket { width: 820px; max-width: 100%; border: 1px solid #222; padding: 18px; }
            .top { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
            .left-brand { width:56%; }
            .logo { display:flex; align-items:center; gap:12px; }
            .logo .brand-box { background:#f57c00; padding:6px 14px; color:#fff; font-weight:700; font-size:18px; border-radius:3px; }
            .company-lines { font-size:12px; color:#333; margin-top:6px; }
            .right-box { width:40%; border-left:3px solid #f2f2f2; padding-left:12px; text-align:right; }
            .right-box .ruc { font-weight:700; font-size:16px; }
            .right-box .doc-title { background:#e9f2ff; padding:6px 8px; margin-top:6px; display:inline-block; border-radius:4px; font-weight:700; font-size:13px; }
            .meta { margin-top:10px; display:flex; gap:10px; font-size:12px; }
            .meta > div { flex:1; }
            .info { margin-top:14px; display:flex; gap:10px; font-size:13px; }
            .info .col { flex:1; }
            .info .label { font-weight:700; color:#333; margin-bottom:4px; display:block; font-size:12px; }
            table.items { width:100%; border-collapse: collapse; margin-top:14px; font-size:12px; }
            table.items th, table.items td { border:1px solid #aaa; padding:8px; text-align:left; vertical-align:middle; }
            table.items th { background:#f7f7f7; text-align:center; font-weight:700; }
            .totals { margin-top:12px; display:flex; justify-content:flex-end; font-size:13px; }
            .totals .inner { width:320px; }
            .totals-row { display:flex; justify-content:space-between; padding:6px 8px; border-bottom:1px dashed #ddd; }
            .totals-row.last { font-weight:700; border-top:2px solid #333; border-bottom:none; padding-top:10px; }
            .payment { margin-top:12px; font-size:12px; display:flex; gap:12px; }
            .payment .left { flex:1; border:1px solid #dedede; padding:8px; border-radius:4px; background:#f9f9f9; }
            .payment .right { width:260px; border:1px solid #dedede; padding:8px; border-radius:4px; background:#f9f9f9; font-size:11px; }
            .footer { margin-top:14px; font-size:11px; text-align:center; color:#444; }
            .note { margin-top:8px; font-size:10px; color:#8a8a8a; text-align:center; }
            @media print { body { margin: 0; } .ticket { border: none; padding: 6mm; } .right-box { padding-left:6px; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow!.focus();
      printWindow!.print();
      printWindow!.close();
      onPrint();
    }, 500);
  };

  const computedSubtotal =
    formData.items?.reduce((sum, it) => sum + (Number(it.subtotal ?? (Number(it.cantidad ?? 0) * Number(it.precioUnitario ?? 0))) || 0), 0) ?? 0;
  const computedIva = formData.iva ?? formData.items?.reduce((sum, it) => sum + (Number(it.iva ?? 0) || 0), 0) ?? 0;
  const computedTotal = total || formData.total || computedSubtotal + Number(computedIva || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[900px] max-w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Vista Previa - Liquidación de Compras</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
        </div>

        <div className="p-4">
          <div id="print-content">
            <div className="ticket" style={{ background: '#fff' }}>
              {/* Top: Brand + Right document box */}
              <div className="top">
                <div className="left-brand">
                  <div className="logo">
                    <div className="brand-box">JUNTA ADMINISTRADORA DE AGUA POTABLE</div>
                  </div>
                  <div className="company-lines">
                    <div>Dirección matriz: {formData.empresaDireccion || 'Av. Ejemplo N23-123 y Ejemplo'}</div>
                    <div>Dirección sucursal: {formData.sucursalDireccion || 'García Moreno y Sucre'}</div>
                  </div>
                </div>
                <div className="right-box">
                  <div className="ruc">R.U.C. {formData.rucEmisor || '1790182345001'}</div>
                  <div className="doc-title">LIQUIDACIÓN DE COMPRAS DE BIENES Y PRESTACIÓN DE SERVICIOS</div>
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    <div>No. {formData.serie || '002'} - {formData.numero || '000-000123456789'}</div>
                    <div>Aut. SRI: {formData.autorizacion || '1234567890'}</div>
                    <div>Fecha de autorización: {formData.fechaAutorizacion || formData.emision || ''}</div>
                  </div>
                </div>
              </div>

              {/* Buyer / document meta */}
              <div className="info">
                <div className="col">
                  <div className="label">Identificación adquirente</div>
                  <div>{formData.cliente || formData.nombre || '-'}</div>
                  <div style={{ marginTop: 6 }}><strong>C.I./RUC:</strong> {formData.cedula || formData.rucComprador || '-'}</div>
                </div>
                <div className="col">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div className="label">Fecha de emisión</div>
                      <div>{formData.emision || '-'}</div>
                    </div>
                    {showVencimiento && (
                      <div style={{ flex: 1 }}>
                        <div className="label">Fecha de vencimiento</div>
                        <div>{formData.vencimiento || ''}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div className="label">Dirección / Lugar operación</div>
                    <div>{formData.direccion || formData.lugarOperacion || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="items" aria-label="Detalle de items">
                <thead>
                  <tr>
                    <th style={{ width: 70, textAlign: 'center' }}>CANT.</th>
                    <th style={{ textAlign: 'left' }}>DESCRIPCIÓN</th>
                    <th style={{ width: 110, textAlign: 'center' }}>P. UNITARIO</th>
                    <th style={{ width: 110, textAlign: 'center' }}>V. TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items && formData.items.length > 0 ? (
                    formData.items.map((item, idx) => {
                      const cantidad = Number(item.cantidad ?? 0);
                      const precio = Number(item.precioUnitario ?? item.precio ?? 0);
                      const subtotal = Number(item.subtotal ?? (cantidad * precio));
                      return (
                        <tr key={idx}>
                          <td style={{ textAlign: 'center' }}>{cantidad}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.descripcion || item.nombre || '-'}</div>
                            {item.codigo && <div style={{ fontSize: 11, color: '#666' }}>Código: {item.codigo}</div>}
                          </td>
                          <td style={{ textAlign: 'center' }}>${formatCurrency(precio)}</td>
                          <td style={{ textAlign: 'center' }}>${formatCurrency(subtotal)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 20 }}>No hay detalles</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals */}
              <div className="totals" role="status" aria-live="polite">
                <div className="inner">
                  <div className="totals-row">
                    <div>Subtotal</div>
                    <div>${formatCurrency(formData.subtotal ?? computedSubtotal)}</div>
                  </div>
                  <div className="totals-row">
                    <div>IVA {formData.ivaPorcentaje ?? '0'}%</div>
                    <div>${formatCurrency(formData.iva ?? computedIva)}</div>
                  </div>
                  {formData.descuento ? (
                    <div className="totals-row">
                      <div>Descuento</div>
                      <div>-${formatCurrency(formData.descuento)}</div>
                    </div>
                  ) : null}
                  <div className="totals-row last">
                    <div>Total</div>
                    <div>${formatCurrency(computedTotal)}</div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="payment">
                <div className="left">
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>FORMA DE PAGO</div>
                  <div>{formData.formaPago || 'EFECTIVO / TARJETA / OTROS'}</div>
                  {formData.valorPago !== undefined && (
                    <div style={{ marginTop: 6 }}>Valor: ${formatCurrency(Number(formData.valorPago))}</div>
                  )}
                </div>
                <div className="right">
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Datos de la imprenta</div>
                  <div>
                    {formData.imprentaNombre || 'Nombre Imprenta / Taller'} <br />
                    RUC: {formData.imprentaRuc || '1700xxxxxx'} <br />
                    Aut.: {formData.imprentaAutorizacion || ''}
                  </div>
                </div>
              </div>

              <div className="footer">
                <div>Documento emitido según normativa SRI.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Imprimir / Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;
