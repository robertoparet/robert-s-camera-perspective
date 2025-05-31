-- VERIFICAR ESTRUCTURA DE LA TABLA imagenes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'imagenes' 
ORDER BY ordinal_position;

-- SI LA COLUMNA NO EXISTE, EJECUTAR ESTO:
ALTER TABLE imagenes 
ADD COLUMN is_cover BOOLEAN DEFAULT FALSE;

-- VERIFICAR QUE SE CREÓ CORRECTAMENTE
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'imagenes' AND column_name = 'is_cover';
