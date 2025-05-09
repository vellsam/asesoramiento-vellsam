import { productos } from '../data/productos';
import { cultivos } from '../data/cultivos';

export function getRecomendaciones({ cultivo, fase, tipo }) {
  if (!cultivo || !fase || !tipo) return [];

  const productoIDs = cultivos[cultivo]?.[fase];
  if (!productoIDs || !Array.isArray(productoIDs)) return [];

  return productoIDs
    .map((id) => productos[id])
    .filter((producto) => {
      if (tipo === 'Ecológica') return producto.eco;
      return true;
    });
}
