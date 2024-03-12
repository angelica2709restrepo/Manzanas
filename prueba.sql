-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-03-2024 a las 19:17:02
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12
use prueba;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `prueba`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `manzanaservicios`
--

CREATE TABLE `manzanaservicios` (
  `Id_M1` int(11) DEFAULT NULL,
  `Id_S1` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `manzanaservicios`
--

INSERT INTO `manzanaservicios` (`Id_M1`, `Id_S1`) VALUES
(1, 6),
(1, 4),
(1, 7),
(2, 6),
(2, 3),
(2, 8),
(3, 1),
(3, 2),
(3, 3),
(3, 4),
(3, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plantel`
--

CREATE TABLE `plantel` (
  `Id_M` int(11) NOT NULL,
  `Nombre` varchar(25) DEFAULT NULL,
  `Dir` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `plantel`
--

INSERT INTO `plantel` (`Id_M`, `Nombre`, `Dir`) VALUES
(1, 'Bosa', 'Kra 103 10-25'),
(2, 'Suba', 'Kra 114F 10-25'),
(3, 'Chapinero', 'Kra 63 10-25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `Id_S` int(11) NOT NULL,
  `Nombre` varchar(25) DEFAULT NULL,
  `Tipo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`Id_S`, `Nombre`, `Tipo`) VALUES
(1, 'Clase de baile', 'Entretenimiento'),
(2, 'Cine ', 'Entretenimiento'),
(3, 'Piscina', 'Deporte'),
(4, 'Gym', 'Deporte'),
(5, 'Cocina', 'Gastronomia'),
(6, 'Lavanderia', 'Aseo'),
(7, 'Coser', 'Maquina'),
(8, 'Yoga', 'Deporte');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes`
--

CREATE TABLE `solicitudes` (
  `Id_solicitudes` int(11) NOT NULL,
  `Fecha` datetime DEFAULT NULL,
  `Id1` int(10) DEFAULT NULL,
  `CodigoS` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `solicitudes`
--

INSERT INTO `solicitudes` (`Id_solicitudes`, `Fecha`, `Id1`, `CodigoS`) VALUES
(3, '2024-03-06 12:42:00', 78, 1),
(4, '2024-03-06 12:46:00', 78, 2),
(5, '2024-03-06 12:50:00', 78, 2),
(6, '2024-03-06 12:57:00', 78, 1),
(7, '2024-03-06 12:58:00', 78, 5),
(8, '2024-03-06 12:59:00', 72, 7),
(9, '2024-03-06 13:05:00', 72, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `Id` int(10) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `Tipo` set('TI','CC') NOT NULL,
  `Documento` varchar(50) NOT NULL,
  `Rol` set('usuario','administrador') NOT NULL DEFAULT 'usuario',
  `Id_M1` int(11) DEFAULT NULL,
  `Manzana` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`Id`, `Nombre`, `Tipo`, `Documento`, `Rol`, `Id_M1`, `Manzana`) VALUES
(72, 'juan', 'TI', '98765', 'usuario', 1, 'Bosa'),
(75, 'Patito', 'CC', '999', 'usuario', 2, 'Suba'),
(76, 'Pollito', 'TI', '5522', 'usuario', 3, 'Chapinero'),
(78, 'pou', 'CC', '5566', 'usuario', 3, 'Chapinero'),
(79, 'owaldo', 'CC', '123456', 'administrador', NULL, '');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `manzanaservicios`
--
ALTER TABLE `manzanaservicios`
  ADD KEY `fk_id2` (`Id_M1`),
  ADD KEY `fk_id3` (`Id_S1`);

--
-- Indices de la tabla `plantel`
--
ALTER TABLE `plantel`
  ADD PRIMARY KEY (`Id_M`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`Id_S`);

--
-- Indices de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD PRIMARY KEY (`Id_solicitudes`),
  ADD KEY `fk_idsoli` (`Id1`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `fk_id1` (`Id_M1`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `plantel`
--
ALTER TABLE `plantel`
  MODIFY `Id_M` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `Id_S` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `Id_solicitudes` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `Id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `manzanaservicios`
--
ALTER TABLE `manzanaservicios`
  ADD CONSTRAINT `fk_id2` FOREIGN KEY (`Id_M1`) REFERENCES `plantel` (`Id_M`),
  ADD CONSTRAINT `fk_id3` FOREIGN KEY (`Id_S1`) REFERENCES `servicios` (`Id_S`);

--
-- Filtros para la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD CONSTRAINT `fk_idsoli` FOREIGN KEY (`Id1`) REFERENCES `usuario` (`Id`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_id1` FOREIGN KEY (`Id_M1`) REFERENCES `plantel` (`Id_M`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

select Nombre, `Tipo`, `Documento`, `Manzana` from usuario where Rol="usuario"

SELECT solicitudes.Id_solicitudes FROM solicitudes WHERE Id1=78;
use prueba;
SELECT usuario.Id FROM usuario WHERE usuario.Nombre="juan" AND Rol="usuario"
