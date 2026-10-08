// Gráfico de barras horizontal simple con ProgressBar de Bootstrap
import React from 'react';
import { ProgressBar } from 'react-bootstrap';

function BarrasReporte({ datos, formato = v => v }) {
    if (!datos.length) return <p className="text-muted small mb-0">Sin datos.</p>;
    const maximo = Math.max(...datos.map(d => d.valor));
    return (
        <div className="d-flex flex-column gap-2">
            {datos.map(d => (
                <div key={d.etiqueta} className="barra-reporte">
                    <div className="d-flex justify-content-between small">
                        <span className="text-truncate me-2">{d.etiqueta}</span>
                        <strong>{formato(d.valor)}</strong>
                    </div>
                    <ProgressBar now={(d.valor / maximo) * 100} style={{ height: 8 }} />
                </div>
            ))}
        </div>
    );
}

export default BarrasReporte;
