---
trigger: always_on
---

# **Buenas Prácticas para Crear un Proyecto de Programación**

## **1\. Introducción**

Desarrollar un proyecto de programación no consiste únicamente en escribir código que funcione. Un buen proyecto debe ser fácil de entender, mantener, ampliar y compartir con otras personas. La mayoría de los problemas graves en software no aparecen porque el código “no funcione”, sino porque con el tiempo se vuelve difícil de modificar, incompatible con nuevas herramientas o imposible de ejecutar en otra computadora.

Por ello, es importante trabajar desde el inicio con buenas prácticas relacionadas con:

* Organización del proyecto.  
* Limpieza y legibilidad del código.  
* Uso correcto de control de versiones.  
* Compatibilidad entre librerías, frameworks, motores y herramientas.  
* Documentación.

---

# **2\. Organización Inicial del Proyecto**

Antes de escribir código, define claramente:

* Objetivo del proyecto.  
* Tecnologías que vas a usar.  
* Versión de cada herramienta.  
* Estructura de carpetas.

Ejemplo de estructura básica:

mi-proyecto/  
│  
├── src/               \# Código fuente principal  
├── assets/            \# Imágenes, sonidos, recursos  
├── docs/              \# Documentación  
├── tests/             \# Pruebas  
├── config/            \# Configuración  
├── README.md          \# Explicación del proyecto  
├── .gitignore         \# Archivos que Git no debe guardar  
├── package.json       \# Dependencias (Node.js)  
├── requirements.txt   \# Dependencias (Python)  
└── LICENSE            \# Licencia del proyecto

## **Recomendaciones**

* Usa nombres de carpetas claros.  
* Evita mezclar código, imágenes y archivos temporales en el mismo lugar.  
* Mantén una sola responsabilidad por carpeta.

Mala práctica:

Proyecto/  
├── imagen1.png  
├── codigo.py  
├── codigo2.py  
├── audio.mp3  
├── prueba\_final\_nueva2.py

Buena práctica:

Proyecto/  
├── src/  
├── assets/images/  
├── assets/audio/  
├── tests/

---

# **3\. Mantener el Código Limpio**

El código limpio es código que otra persona —o tú mismo dentro de seis meses— puede leer sin dificultad.

## **3.1 Usa nombres descriptivos**

Evita nombres ambiguos.

Malo:

x \= 10  
y \= 20  
z \= x \+ y

Bueno:

precio\_producto \= 10  
costo\_envio \= 20  
precio\_total \= precio\_producto \+ costo\_envio

## **3.2 Funciones pequeñas y claras**

Cada función debe hacer una sola cosa.

Malo:

def procesar\_usuario(usuario):  
    \# valida  
    \# guarda  
    \# manda correo  
    \# imprime reporte

Bueno:

def validar\_usuario(usuario):  
    pass

def guardar\_usuario(usuario):  
    pass

def enviar\_correo(usuario):  
    pass

## **3.3 Evita repetir código**

Si copias y pegas varias veces el mismo bloque, probablemente deberías convertirlo en una función.

Malo:

precio1 \= producto1 \* 1.16  
precio2 \= producto2 \* 1.16  
precio3 \= producto3 \* 1.16

Bueno:

def agregar\_iva(precio):  
    return precio \* 1.16

## **3.4 Usa comentarios solo cuando sean necesarios**

No expliques lo obvio.

Malo:

\# suma 1 a la variable  
contador \= contador \+ 1

Bueno:

\# Reinicia el contador cuando el jugador pierde la partida  
contador \= 0

## **3.5 Sigue un estilo consistente**

Por ejemplo:

* Mismo tipo de sangría.  
* Mismos nombres para variables.  
* Mismo formato de llaves o paréntesis.  
* Mismo idioma en el código.

Si empiezas en español, no mezcles después inglés sin razón.

Malo:

usuario \= "Juan"  
playerLives \= 3  
numeroDeErrores \= 2

Bueno:

usuario \= "Juan"  
vidas\_jugador \= 3  
numero\_errores \= 2

---

# **4\. Divide el Proyecto en Módulos**

No pongas todo en un solo archivo.

Malo:

main.py con 5000 líneas

Bueno:

src/  
├── main.py  
├── login.py  
├── inventario.py  
├── interfaz.py  
└── utilidades.py

Ventajas:

* Más fácil encontrar errores.  
* Más fácil reutilizar partes.  
* Más fácil trabajar en equipo.

---

# **5\. Usa Control de Versiones**

La herramienta más importante para cualquier proyecto es Git.

entity\["software","Git","Sistema de control de versiones"\] permite:

* Guardar cambios.  
* Volver a versiones anteriores.  
* Trabajar en equipo.  
* Evitar perder trabajo.

También es recomendable usar entity\["company","GitHub","Plataforma de alojamiento de repositorios"\], entity\["company","GitLab","Plataforma de desarrollo y repositorios"\] o entity\["company","Bitbucket","Servicio de repositorios Git"\].

## **Buenas prácticas con Git**

* Haz commits pequeños y frecuentes.  
* Escribe mensajes claros.  
* No subas archivos innecesarios.  
* Usa ramas.

Mal commit:

arreglos

Buen commit:

Corrige validación del formulario de registro

Ejemplo de ramas:

main  
feature/login  
feature/inventario  
bugfix/error-sonido

---

# **6\. La Importancia de la Compatibilidad de Versiones**

Uno de los errores más comunes en programación ocurre cuando un proyecto funciona en una computadora, pero falla en otra.

Esto suele pasar porque:

* Se usa otra versión del lenguaje.  
* Cambió una librería.  
* El motor o framework es distinto.  
* Una dependencia dejó de ser compatible.

## **Ejemplo real**

Un proyecto hecho en:

* entity\["software","Python","Lenguaje de programación"\] 3.10  
* Librería A versión 2.1  
* Librería B versión 5.0

puede dejar de funcionar si alguien instala:

* Python 3.13  
* Librería A 3.0  
* Librería B 6.2

porque algunas funciones pueden haber cambiado o eliminado.

## **6.1 Nunca dependas de “la última versión”**

Muchos principiantes instalan siempre la versión más reciente de todo. Eso parece buena idea, pero puede romper tu proyecto.

Mejor práctica:

* Elegir versiones estables.  
* Probar que funcionan juntas.  
* Guardarlas por escrito.

Ejemplo:

Python 3.11.8  
Django 5.0.4  
SQLite 3.45

---

# **7\. Congela las Dependencias**

Debes guardar exactamente qué versiones usa tu proyecto.

## **En Python**

Usa:

requirements.txt

Ejemplo:

flask==3.0.2  
numpy==1.26.4  
pygame==2.5.2

## **En Node.js**

Usa:

package.json  
package-lock.json

Ejemplo:

{  
  "dependencies": {  
    "express": "4.19.2",  
    "react": "18.2.0"  
  }  
}

## **En motores de videojuegos**

Si trabajas con videojuegos, como tu proyecto de cadena de suministro o cualquier juego en Godot, es especialmente importante usar la misma versión del motor.

Por ejemplo, un proyecto hecho en entity\["software","Godot Engine","Motor de videojuegos"\] 4.2 puede tener errores o no abrir correctamente en Godot 4.5 o Godot 3.5.

Por eso conviene:

* Escribir la versión exacta del motor.  
* No actualizar el motor a mitad del proyecto sin probar.  
* Hacer respaldo antes de migrar.

Ejemplo:

Motor: Godot 4.2.1  
Export Templates: 4.2.1  
Plugin X: versión 1.4.0

---

# **8\. Revisa Compatibilidad Antes de Actualizar**

Antes de actualizar cualquier herramienta:

1. Lee las notas de la nueva versión.  
2. Verifica si rompe compatibilidad.  
3. Haz una copia del proyecto.  
4. Prueba primero en otra rama.

Nunca hagas esto directamente:

Actualizar todas las dependencias al mismo tiempo

Porque si algo falla, no sabrás cuál fue la causa.

Mejor:

Actualizar una dependencia, probar, guardar.  
Luego actualizar la siguiente.

---

# **9\. Usa Entornos Separados**

Nunca instales todas tus librerías globalmente.

Usa entornos virtuales.

## **Python**

python \-m venv venv

## **Node.js**

Cada proyecto usa su propia carpeta de dependencias.

## **Docker**

entity\["software","Docker","Plataforma de contenedores"\] es muy útil porque guarda exactamente el entorno que necesita el proyecto.

Ventajas:

* Mismas versiones para todos.  
* El proyecto funciona igual en cualquier computadora.  
* Menos errores de compatibilidad.

---

# **10\. Documenta Todo**

Aunque el proyecto sea pequeño, crea un archivo README.

Debe incluir:

* Qué hace el proyecto.  
* Qué versiones necesita.  
* Cómo instalarlo.  
* Cómo ejecutarlo.  
* Dependencias.  
* Problemas conocidos.

Ejemplo:

\# Instalación

Python 3.11.8

pip install \-r requirements.txt  
python main.py

Una persona debería poder descargar tu proyecto y ejecutarlo solo leyendo ese archivo.

---

# **11\. Haz Pruebas Frecuentes**

No esperes a terminar el proyecto para probarlo.

Buena práctica:

* Probar cada función nueva.  
* Revisar que siga funcionando después de cambios.  
* Crear pruebas automáticas cuando sea posible.

Ejemplo de carpetas:

tests/  
├── test\_login.py  
├── test\_inventario.py  
└── test\_api.py

---

# **12\. Errores Comunes que Debes Evitar**

* Guardar todo en un solo archivo.  
* No usar Git.  
* Mezclar muchas versiones distintas.  
* Actualizar librerías sin revisar compatibilidad.  
* No documentar.  
* Copiar código repetido.  
* Poner nombres confusos.  
* Trabajar directamente en la rama principal.  
* No hacer respaldos antes de actualizar.

---

# **13\. Checklist Final Antes de Empezar un Proyecto**

Antes de comenzar, asegúrate de tener:

* Objetivo del proyecto definido.  
* Estructura de carpetas.  
* Repositorio Git creado.  
* Archivo README.  
* Lista de versiones necesarias.  
* Dependencias congeladas.  
* Entorno virtual o aislado.  
* Convención para nombres y estilo.  
* Sistema de pruebas.  
* Respaldo antes de actualizar algo.

---

# **14\. Conclusión**

Un proyecto ordenado y compatible ahorra muchísimo tiempo. Es más fácil corregir errores, trabajar con otras personas y seguir desarrollándolo en el futuro.

La limpieza del código no es un lujo: es una inversión. Y la compatibilidad de versiones es una de las cosas más importantes de todo el proyecto. Muchas veces un programa no falla porque el código esté mal, sino porque una librería, motor o herramienta tiene una versión distinta.

La mejor práctica es simple:

Define tus versiones, documenta tu proyecto y mantén tu código organizado desde el primer día.

