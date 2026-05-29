import { useState, useRef, useEffect } from 'react';

type Cuenta = {
  id?: number;
  cuentaId?: number;
  codigo: string;
  nombre: string;
};

type Props = {
  cuentas: Cuenta[];
  value: number | null | undefined;
  onChange: (id: number) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function CuentaSelect({ cuentas, value, onChange, placeholder = 'Seleccione cuenta...', disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedCuenta = cuentas.find(c => (c.id ?? c.cuentaId) === value);

  useEffect(() => {
    if (selectedCuenta && !open) {
      setSearch(`${selectedCuenta.codigo} — ${selectedCuenta.nombre}`);
    }
    if (!value && !open) {
      setSearch('');
    }
  }, [selectedCuenta, value, open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        // Reset search to selected value if no selection was made
        if (selectedCuenta) {
          setSearch(`${selectedCuenta.codigo} — ${selectedCuenta.nombre}`);
        } else {
          setSearch('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCuenta]);

  const filtered = cuentas.filter(c => {
    const term = search.toLowerCase();
    return c.codigo.toLowerCase().includes(term) || c.nombre.toLowerCase().includes(term);
  });

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        className="input input-bordered w-full"
        placeholder={placeholder}
        value={search}
        disabled={disabled}
        onFocus={() => {
          setOpen(true);
          setSearch('');
        }}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
      />
      {open && (
        <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-base-100 shadow-xl border border-base-300 rounded-box py-1">
          {filtered.length > 0 ? (
            filtered.map((c) => {
              const cId = c.id ?? c.cuentaId!;
              return (
                <li
                  key={cId}
                  className="px-4 py-2 hover:bg-base-200 cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevents input onBlur
                    onChange(cId);
                    setSearch(`${c.codigo} — ${c.nombre}`);
                    setOpen(false);
                  }}
                >
                  <span className="font-mono text-xs mr-2">{c.codigo}</span>
                  {c.nombre}
                </li>
              );
            })
          ) : (
            <li className="px-4 py-2 text-gray-500 italic">No hay resultados</li>
          )}
        </ul>
      )}
    </div>
  );
}
