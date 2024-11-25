<?php
include('db.php');

if (isset($_GET['action'])) {

    // Obtener provincias
    if ($_GET['action'] == 'getProvincias') {
        $stmt = $pdo->prepare("SELECT * FROM provincias");
        $stmt->execute();
        $provincias = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($provincias);
    }
    
    // Obtener municipios
    if ($_GET['action'] == 'getMunicipios') {
        $provincia_id = $_GET['provincia_id'];
        $stmt = $pdo->prepare("SELECT * FROM municipios WHERE provincia_id = ?");
        $stmt->execute([$provincia_id]);
        $municipios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($municipios);
    }
    
    // Insertar localidades
    if ($_GET['action'] == 'insertLocalidad') {
        $descripcion = isset($_POST['descripcion']) ? trim($_POST['descripcion']) : '';
        $cant_habitantes = isset($_POST['cant_habitantes']) ? (int) $_POST['cant_habitantes'] : 0;
        $municipio_id = isset($_POST['municipio_id']) ? (int) $_POST['municipio_id'] : 0;
        $provincia_id = isset($_POST['provincia_id']) ? (int) $_POST['provincia_id'] : 0;

        // Validación de la provincia
        if (empty($provincia_id)) {
            echo json_encode(['message' => 'Debe seleccionar una provincia']);
            exit;
        }
        // Validación del municipio
        if (empty($municipio_id)) {
            echo json_encode(['message' => 'Debe seleccionar un municipio']);
            exit;
        }

        // Validación de la descripción
        $descripcionRegex = '/^([A-Za-z]{3,}(\s[A-Za-z]{3,})+)$/';
        if (empty($descripcion) || !preg_match($descripcionRegex, $descripcion)) {
            echo json_encode(['message' => 'La descripción debe tener al menos 2 palabras, cada una de al menos 3 caracteres']);
            exit;
        }

        // Validación de la cantidad de habitantes
        if ($cant_habitantes < 100) {
            echo json_encode(['message' => 'La cantidad de habitantes debe ser mayor o igual a 100']);
            exit;
        }

        // Verificación de la existencia de la provincia en la base de datos
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM provincias WHERE id = ?");
        $stmt->execute([$provincia_id]);
        $provinciaExists = $stmt->fetchColumn();
        
        if ($provinciaExists == 0) {
            echo json_encode(['message' => 'La provincia seleccionada no existe']);
            exit;
        }

        // Verificación de existencia del municipio en la base de datos
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM municipios WHERE id = ?");
        $stmt->execute([$municipio_id]);
        $municipioExists = $stmt->fetchColumn();
        
        if ($municipioExists == 0) {
            echo json_encode(['message' => 'El municipio seleccionado no existe']);
            exit;
        }

        // Si todas las validaciones pasan, insertar en la base de datos
        try {
            $stmt = $pdo->prepare("INSERT INTO localidades (descripcion, cant_habitantes, municipio_id) VALUES (?, ?, ?)");
            $stmt->execute([$descripcion, $cant_habitantes, $municipio_id]);
            echo json_encode(['message' => 'Localidad registrada exitosamente']);
        } catch (Exception $e) {
            echo json_encode(['message' => 'Error al registrar la localidad: ' . $e->getMessage()]);
        }

    }
}

?>

