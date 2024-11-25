document.addEventListener('DOMContentLoaded', function () {
    loadProvincias();

    // Cargar provincias desde el backend
    function loadProvincias() {
        fetch('backend.php?action=getProvincias')
            .then(response => response.json())
            .then(provincias => {
                const provinciaSelect = document.getElementById('provincia');
                provinciaSelect.selected = false;
                provincias.forEach(provincia => {
                    const option = document.createElement('option');
                    option.value = provincia.id;
                    option.textContent = provincia.descripcion;
                    provinciaSelect.appendChild(option);
                });
            });
    }

    // Función para mostrar error en el campo con mensaje
    function setError(inputField, message) {
        inputField.classList.add('is-invalid');
        const errorDiv = inputField.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
            errorDiv.textContent = message;
            errorDiv.classList.add('d-block');
            errorDiv.classList.remove('d-none');
        }
    }

    // Función para marcar el campo como válido
    function setValid(inputField) {
        inputField.classList.remove('is-invalid'); // Eliminar clase de error
        inputField.classList.add('is-valid'); // Agregar clase de éxito (opcional)
        const errorDiv = inputField.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
            errorDiv.classList.remove('d-block'); // Ocultar el mensaje de error
            errorDiv.classList.add('d-none'); // Asegurarse de que esté oculto
        }
    }

    // Función para resetear los errores previos
    function resetErrors() {
        const inputs = document.querySelectorAll('.form-control');
        const selects = document.querySelectorAll('.form-select');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
            input.classList.remove('is-valid');
            const errorDiv = input.nextElementSibling;
            if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
                errorDiv.classList.remove('d-block');
                errorDiv.classList.add('d-none');
            }
        });
        selects.forEach(input => {
            input.classList.remove('is-invalid');
            input.classList.remove('is-valid');
            const errorDiv = input.nextElementSibling;
            if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
                errorDiv.classList.remove('d-block');
                errorDiv.classList.add('d-none');
            }
        });
    }

    function showToastError(message) {
        const toastElement = document.getElementById('errorToast');
        const toastMessageElement = document.getElementById('errorToastMessage');
        toastMessageElement.innerText = message;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }

    
    // Validación de la Provincia
    document.getElementById('provincia').addEventListener('change', function () {
        const provincia = this;
        if (provincia.value === "") {
            setError(provincia, 'Debe seleccionar una provincia.');
        } else {
            setValid(provincia);
        }
    });

    // Validación del Municipio
    document.getElementById('municipio').addEventListener('change', function () {
        const municipioId = this;
        if (municipioId.value === "") {
            setError(municipioId, 'Debe seleccionar un municipio.');
        } else {
            setValid(municipioId);
        }
    });

    // Validación de la Descripción
    document.getElementById('descripcion').addEventListener('input', function () {
        const descripcion = this;
        const descripcionRegex = /^([A-Za-z]{3,}(\s[A-Za-z]{3,})+)$/;
        if (descripcion.value.trim().length < 3 || !descripcionRegex.test(descripcion.value.trim())) {
            setError(descripcion, 'La descripción debe tener al menos 2 palabras y 3 caracteres cada una.');
        } else {
            setValid(descripcion);
        }
    });

    // Validación de Habitantes
    document.getElementById('habitantes').addEventListener('input', function () {
        const habitantes = this;
        if (habitantes.value < 100 || habitantes.value === "") {
            setError(habitantes, 'La cantidad de habitantes debe ser mayor o igual a 100.');
        } else {
            setValid(habitantes);
        }
    });

    // Cargar municipios al seleccionar una provincia
    document.getElementById('provincia').addEventListener('change', function () {
        const provinciaId = this.value;
        if (provinciaId) {
            fetch(`backend.php?action=getMunicipios&provincia_id=${provinciaId}`)
                .then(response => response.json())
                .then(municipios => {
                    const municipioSelect = document.getElementById('municipio');
                    municipios.forEach(municipio => {
                        const option = document.createElement('option');
                        option.value = municipio.id;
                        option.textContent = municipio.descripcion;
                        municipioSelect.appendChild(option);
                    });
                });
        }
    });

    // Validación y envío del formulario
    const localidadForm = document.getElementById('localidadForm');
    localidadForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const descripcion = document.getElementById('descripcion');
        const habitantes = document.getElementById('habitantes');
        const municipioId = document.getElementById('municipio');
        const provincia = document.getElementById('provincia');
        console.log(provincia.value);

        let valid = true;

        // Validación de la Provincia
        if (provincia.value === "") {
            setError(provincia, 'Debe seleccionar una provincia.');
            valid = false;
        } else {
            setValid(provincia);
        }

        // Validación del Municipio
        if (municipioId.value === "") {
            setError(municipioId, 'Debe seleccionar un municipio.');
            valid = false;
        } else {
            setValid(municipioId);
        }

        // Validación de la Descripción (mínimo 3 caracteres)
        const descripcionRegex = /^([A-Za-z]+(\s[A-Za-z]+)+)$/;
        if (descripcion.value.trim().length < 3 || !descripcionRegex.test(descripcion.value.trim())) {
            setError(descripcion, 'La descripción debe tener al menos 2 palabras y 3 caracteres cada una.');
            valid = false;
        } else {
            setValid(descripcion);
        }

        // Validación de Habitantes (mínimo 100)
        if (habitantes.value < 100 || habitantes.value === "") {
            setError(habitantes, 'La cantidad de habitantes debe ser mayor o igual a 100.');
            valid = false;
        } else {
            setValid(habitantes);
        }

        if (valid) {
            // Enviar datos al backend para registro
            const formData = new FormData();
            formData.append('descripcion', descripcion.value.trim());
            formData.append('cant_habitantes', habitantes.value);
            formData.append('municipio_id', municipioId.value);
            formData.append('provincia_id', provincia.value);

            fetch('backend.php?action=insertLocalidad', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Localidad registrada exitosamente') {
                    const modal = new bootstrap.Modal(document.getElementById('successModal'));
                    modal.show();
                    localidadForm.reset();
                    resetErrors();
                } else {
                    showToastError(data.message);
                }
            });
        } else {
            showToastError("Por favor, complete todos los campos correctamente.");
        }
    });

});


