// Selects dependientes: al cambiar la región se cargan sus comunas
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import CampoFormulario from './CampoFormulario';
import { regiones, comunasDe } from '../../data/regiones';

function SelectRegionComuna({ region, comuna, onChange, errores = {}, requerido = true }) {
    return (
        <Row>
            <Col md={6}>
                <CampoFormulario id="region" label="Región" as="select" requerido={requerido}
                    valor={region} error={errores.region}
                    onChange={valor => { onChange('region', valor); onChange('comuna', ''); }}>
                    <option value="">-- Seleccione la región --</option>
                    {regiones.map(r => <option key={r.nombre} value={r.nombre}>{r.nombre}</option>)}
                </CampoFormulario>
            </Col>
            <Col md={6}>
                <CampoFormulario id="comuna" label="Comuna" as="select" requerido={requerido}
                    valor={comuna} error={errores.comuna} disabled={!region}
                    onChange={valor => onChange('comuna', valor)}>
                    <option value="">-- Seleccione la comuna --</option>
                    {comunasDe(region).map(c => <option key={c} value={c}>{c}</option>)}
                </CampoFormulario>
            </Col>
        </Row>
    );
}

export default SelectRegionComuna;
