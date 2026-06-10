import { useState, useCallback } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  Download,
} from "lucide-react";

interface PreviewRow {
  nombre: string;
  email: string;
  telefono: string;
  fuente: string;
  estado: string;
  mensaje: string;
  campana: string;
  valid: boolean;
}

const mapSource = (val: string): string => {
  const v = val.toLowerCase().trim();
  if (v.includes("whatsapp")) return "whatsapp-web";
  if (v.includes("instagram")) return "instagram";
  if (v.includes("facebook")) return "facebook";
  if (v.includes("meta") || v.includes("ads")) return "meta-ads";
  if (v.includes("formulario") || v.includes("web")) return "formulario-web";
  return "otro";
};

const mapStatus = (val: string): string => {
  const v = val.toLowerCase().trim();
  if (v.includes("nuevo")) return "nuevo";
  if (v.includes("contactado")) return "contactado";
  if (v.includes("seguimiento")) return "en-seguimiento";
  if (v.includes("convertido")) return "convertido";
  if (v.includes("no") || v.includes("interesado")) return "no-interesado";
  if (v.includes("pendiente")) return "pendiente";
  return "nuevo";
};

export function ImportPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [imported, setImported] = useState(false);
  const [count, setCount] = useState(0);

  const utils = trpc.useUtils();
  const createLead = trpc.lead.create.useMutation({
    onSuccess: () => {
      utils.lead.list.invalidate();
      utils.lead.stats.invalidate();
    },
  });

  const parseCSV = (text: string): PreviewRow[] => {
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) return [];

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase().replace(/"/g, ""));

    const getCol = (cols: string[], ...names: string[]) => {
      for (const name of names) {
        const idx = headers.findIndex((h) => h.includes(name));
        if (idx >= 0 && idx < cols.length)
          return cols[idx]
            .trim()
            .replace(/^"|"$/g, "")
            .replace(/""/g, '"');
      }
      return "";
    };

    return lines
      .slice(1)
      .map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        const nombre = getCol(cols, "nombre", "name", "nombres", "full name");
        const email = getCol(cols, "email", "correo", "mail", "e-mail");
        const telefono = getCol(
          cols,
          "telefono",
          "tel",
          "phone",
          "celular",
          "movil",
          "contacto",
        );
        const fuente = getCol(cols, "fuente", "source", "origen", "canal");
        const estado = getCol(cols, "estado", "status", "etapa", "stage");
        const mensaje = getCol(
          cols,
          "mensaje",
          "message",
          "consulta",
          "comentario",
          "nota",
        );
        const campana = getCol(
          cols,
          "campana",
          "campanna",
          "campaign",
          "ad",
          "anuncio",
        );

        return {
          nombre,
          email,
          telefono,
          fuente,
          estado,
          mensaje,
          campana,
          valid: nombre.length > 0 && email.length > 0 && telefono.length > 0,
        };
      })
      .filter((r) => r.nombre || r.email || r.telefono);
  };

  const handleFile = useCallback((file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      alert("Por favor selecciona un archivo CSV");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const rows = parseCSV(text);
        setPreview(rows);
        setImported(false);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    const validRows = preview.filter((r) => r.valid);
    let importedCount = 0;

    for (const row of validRows) {
      try {
        await createLead.mutateAsync({
          nombre: row.nombre,
          email: row.email,
          telefono: row.telefono,
          fuente: mapSource(row.fuente) as any,
          estado: mapStatus(row.estado) as any,
          mensaje: row.mensaje || undefined,
          campana: row.campana || undefined,
        });
        importedCount++;
      } catch {
        // skip failed rows
      }
    }

    setCount(importedCount);
    setImported(true);
    setPreview([]);
  };

  const downloadTemplate = () => {
    const headers =
      "Nombre,Email,Telefono,Fuente,Estado,Mensaje,Campana\n";
    const example =
      'Juan Perez,juan@email.com,+5491123456789,WhatsApp Web,Nuevo,Hola me interesa,Campana Junio\n';
    const blob = new Blob(["\ufeff" + headers + example], {
      type: "text/csv",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "plantilla_leads.csv";
    link.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Importar Leads</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Sube un archivo CSV para importar leads desde Google Sheets u otras
          fuentes
        </p>
      </div>

      {imported && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-emerald-800">
              Importacion exitosa
            </h3>
            <p className="text-sm text-emerald-700">
              Se importaron {count} leads correctamente.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            onClick={() => setImported(false)}
          >
            Importar mas
          </Button>
        </div>
      )}

      {!imported && (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
              isDragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 bg-gray-50/50 hover:border-gray-400"
            }`}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Arrastra tu archivo CSV aqui
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              o haz clic para seleccionar un archivo
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleInputChange}
              className="hidden"
              id="csv-input"
            />
            <label htmlFor="csv-input">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Seleccionar archivo</span>
              </Button>
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-center gap-4">
            <FileSpreadsheet className="w-8 h-8 text-blue-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">
                Necesitas la plantilla?
              </h3>
              <p className="text-sm text-blue-700">
                Descarga la plantilla CSV con el formato correcto para importar
                tus leads.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 gap-1.5"
              onClick={downloadTemplate}
            >
              <Download className="w-4 h-4" />
              Descargar
            </Button>
          </div>

          {preview.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Vista previa</h3>
                  <p className="text-sm text-gray-500">
                    {preview.length} filas encontradas ·{" "}
                    {preview.filter((r) => r.valid).length} validas
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPreview([])}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-blue-500 hover:bg-blue-600"
                    onClick={handleImport}
                    disabled={createLead.isPending}
                  >
                    <Upload className="w-4 h-4" />
                    {createLead.isPending
                      ? "Importando..."
                      : `Importar ${preview.filter((r) => r.valid).length} leads`}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">
                        Estado
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">
                        Nombre
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">
                        Email
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">
                        Telefono
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">
                        Fuente
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {preview.map((row, i) => (
                      <tr key={i} className={!row.valid ? "bg-red-50/50" : ""}>
                        <td className="px-4 py-2">
                          {row.valid ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row.nombre || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {row.email || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {row.telefono || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {mapSource(row.fuente)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
