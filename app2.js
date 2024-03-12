const express=require('express');
const bodyParser = require("body-parser");
const mysql= require('mysql2/promise');
const app = express();
const session=require('express-session');
const path=require("path");
const { connect } = require('http2');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(session({
    secret:'hola', 
    resave:false, //volver a pedir cookies
    saveUninitialized:false //cerrar
}))
app.use(express.static(path.join(__dirname)))
//Crear constante base de datos
const db={
    host:'localhost',
    user:"root",
    password:"",
    database:"prueba"
}
app.post('/crear',async(req,res)=>{
    const {Nombre, Tipo, Documento, Manzana}=req.body;
    try{
//Verificador de usuario
    const conec=await mysql.createConnection(db)
    const[indicador]= await conec.execute('SELECT * FROM usuario WHERE Documento=? AND Tipo=?',[Documento,Tipo])
    if(indicador.length>0){
        res.status(409).send(`
        <script>
        window.onload=function(){
            alert('Ya existe este usuario'); 
        window.location.href="./registro.html";
        }
        </script>
        `)
    }
//Insertar llave foranea a la tabla usuario
    else{
        conec.query('INSERT INTO usuario (Nombre,Tipo,Documento,Manzana) VALUES (?,?,?,?)',[Nombre, Tipo, Documento, Manzana]);
        const [foranea]= await conec.query('select Id_M from plantel INNER JOIN usuario ON plantel.Id_M=usuario.Id_M1 WHERE usuario.Manzana=?',[Manzana]);
        conec.query('UPDATE usuario SET Id_M1=? WHERE usuario.Manzana=? AND usuario.Nombre=?',[foranea[0].Id_M,Manzana,Nombre]);
        conec.query('UPDATE usuario set rol="usuario" where Documento=?',[Documento])
        console.log(foranea)
    res.status(201).send(`
    <script>
    window.onload=function(){
        alert('Su registro fue completado');
    window.location.href="./ingreso.html";
    }
    </script>
    `)}
    await conec.end();
    }
    catch(error){
        console.error('Error en el servidor:',error);
        res.status(500).send("F");
    }
})

//Ruta para manejar el login
app.post("/iniciar", async (req, res) =>{
    const  {Tipo,Documento} = req.body;
    try{
//Verificar las credenciales
        const conec=await mysql.createConnection(db)
        const[indicador]= await conec.execute('SELECT * FROM usuario WHERE Documento=? AND Tipo=?',
        [Documento,Tipo])
        console.log(indicador);
//Dar bienvenida con el nombre y manzana
        if(indicador.length>0){
            req.session.usuario=[indicador[0].Nombre,indicador[0].Manzana]
            req.session.Documento=Documento
        if (indicador[0].Rol=="administrador"){
            const usuario={Nombre:indicador[0].Nombre}
            console.log(usuario)
            res.locals.usuario=usuario
            res.redirect('./admin.html')
        }
        else{
            const usuario={Nombre:indicador[0].Nombre, Manzana:indicador[0].Manzana}
            console.log(usuario)
            res.locals.usuario=usuario

            res.sendFile(path.join(__dirname,'usuario.html'))
        }
    }
    else{
        res.status(401).send(`
        <script>
        window.onload=function(){
        alert("No existes xd");
        window.location.href='/ingreso.html'
        }
        </script>
        `)
    }
        await conec.end()
    }
    catch(error){
        console.error("error pendejo del servidor:", error);
        res.status(500).send(`
        <script>
        window.onload=function(){
            alert('Error'); 
        window.location.href="./ingreso.html";
        }
        </script>
        `)
    }
})
//Obtener nombre y manzana de usuario
app.post('/obtener-usuario',(req,res)=>{
    const usuario=req.session.usuario;
    if(usuario){
        res.json({Nombre:usuario[0], Manzana:usuario[1]})
    }
    else{
    res.status(401).send("Usuario no autenticado");
    }
})

app.post('/obtener-servicios-usuario',async(req,res)=>{
    const usuario=req.session.usuario
    const Documento=req.session.Documento
    console.log(usuario)
    try{
        const conec=await mysql.createConnection(db);
        const [serviciosData]=await conec.execute('SELECT servicios.Nombre FROM usuario INNER JOIN plantel on plantel.Id_M = usuario.Id_M1 INNER JOIN manzanaservicios ON manzanaservicios.id_M1 = plantel.Id_M INNER JOIN servicios on servicios.Id_S = manzanaservicios.Id_S1  WHERE usuario.Documento=?',[Documento])
        console.log(serviciosData)
        res.json({servicios:serviciosData.map(row=>row.Nombre)})
        await conec.end()
    }
    catch(error){
        console.log("Error obteniendo servicios",error)
    }
})

app.post('/guardar-servicios-usuario',async(req,res)=>{
    const usuario=req.session.usuario
    const Documento=req.session.Documento
    const {servicios,fechaHora}=req.body
    try{
        const conec=await mysql.createConnection(db)
        const [Idus]= await conec.query('SELECT servicios.Id_S,usuario.Id FROM usuario INNER JOIN plantel on plantel.Id_M = usuario.Id_M1 INNER JOIN manzanaservicios ON manzanaservicios.Id_M1 = plantel.Id_M INNER JOIN servicios on servicios.Id_S = manzanaservicios.Id_S1 WHERE usuario.Documento=? AND servicios.Nombre=?',[Documento,servicios])
        console.log(Idus)
        await conec.execute('INSERT INTO solicitudes(Id1,Fecha,CodigoS) VALUES (?,?,?)',[Idus[0].Id,fechaHora,Idus[0].Id_S]);
        res.status(200).send('Datos guardados exitosamente')
        await conec.end();
    }
    catch(error){
        console.log("Error guardando servicios",error)
    }
})
app.post('/obtener-servicios-guardados',async(req,res)=>{
    const usuario=req.session.usuario
    const Documento=req.session.Documento
    try{
        const conec=await mysql.createConnection(db)
        const [Idu]=await conec.execute('SELECT Id FROM usuario WHERE Documento=?',[Documento])
        const [serviciosGuardadosData]=await conec.query('SELECT servicios.Nombre, solicitudes.Fecha, solicitudes.Id_solicitudes FROM servicios INNER JOIN manzanaservicios on manzanaservicios.Id_S1=servicios.Id_S INNER JOIN plantel on manzanaservicios.Id_M1= plantel.Id_M INNER JOIN usuario on plantel.Id_M=usuario.Id_M1 INNER JOIN solicitudes on usuario.Id=solicitudes.Id1 where solicitudes.Id1=? and solicitudes.CodigoS = servicios.Id_S',[Idu[0].Id])
        console.log(serviciosGuardadosData)
        console.log(Idu[0].Id)
        const serviciosGuardadosFiltrados=serviciosGuardadosData.map(servicio=>({
        Nombre:servicio.Nombre,
        Fecha:servicio.Fecha,
        id:servicio.Id_solicitudes
    }))
//Enviar los datos al cliente
        res.json({serviciosGuardados:serviciosGuardadosFiltrados})
        await conec.end()
    }
    catch(error){
        console.error('Error en el servidor',error);
        res.status(500).send("Error en el servidor")
    }
})

app.post('/eliminar-servicio',async(req,res) =>{
    const usuario=req.session.usuario
    const Documento=req.session.Documento
    const conec=await mysql.createConnection(db);
    const[idsolicitud]=await conec.query('SELECT solicitudes.Id_solicitudes FROM solicitudes INNER JOIN usuario ON usuario.Id=solicitudes.Id1 INNER JOIN plantel ON plantel.Id_M=usuario.Id_M1 INNER JOIN manzanaservicios ON manzanaservicios.Id_M1=plantel.Id_M INNER JOIN servicios ON servicios.Id_S=manzanaservicios.Id_S1 WHERE usuario.Documento=?',[Documento]);
    console.log(idsolicitud[0]);
    try{
        await conec.query('DELETE FROM solicitudes WHERE Id_solicitudes=?',[idsolicitud[0].Id_solicitudes])
        res.status(200).send("melo XD")
        await conec.end();
    }
    catch (error){
        console.error('Error en el servidor',error);
        res.status(500).send("Error en el servidor")
    }

})

/*
app.post('/obtener-servicios-usuario',async (req,res)=>{
    const {usuario}= req.body                                                                                                                              
    try{
        const conec=await mysql.createConnection(db)
        const[serviciosData]= await conec.execute('SELECT servicios.Nombre FROM usuario INNER JOIN plantel on plantel.id_m = usuario.id_p1 INNER JOIN manzanaservicios ON manzanaservicios.id_plantel = plantel.id_m INNER JOIN servicios on servicios.id_s = manzanaservicios.id_servicio  WHERE usuario.Nombre =?',[usuario])
        res.json({servicios: serviciosData.map(row=>row.Nombre)})
    await conec.end()
    }
    catch(error){
        console.log('Error en el servidor:', error);
        res.status(500).send('Error en el servidor');
    }
})

//Guardar servicios
app.post('/guardar-servicios-usuario',async(req,res)=>{
    const {usuario,servicios,fechaHora}=req.body
    
    const conec=await mysql.createConnection(db)
    const [consulID]= await conec.query('SELECT id FROM usuario WHERE Nombre=?',[usuario])
    const [Codigo]= await conec.query('SELECT id_s FROM servicios WHERE Nombre=?',[servicios])
    await conec.end()
    console.log(consulID,Codigo)
    try{
        const conec=await mysql.createConnection(db)
        for (const servicio of servicios){
            await conec.execute('INSERT INTO solicitudes(`id_so`,`fecha`,`CodigoS`) VALUES (?,?,?)',[consulID[0].id,fechaHora,Codigo[0].id_s]);
            console.log("Datos guardados")
        }
        await conec.end()
    }
    catch(error){
        console.error('Error en el servidor',error)
        res.status(500).send('Error en el servidor')
    }
})
//Mostrar servicios seleccionados
app.post('/mostrar-servicios-usuario',async(req,res)=>{
    const {usuario}=req.body;
    try{
        const conec=await mysql.createConnection(db)
        const[solicitudata]=await conec.execute('SELECT solicitudes.fecha, servicios.`Nombre` FROM solicitudes INNER JOIN usuario on solicitudes.id_so = usuario.id INNER JOIN plantel on usuario.id_p1 = plantel.id_m INNER JOIN manzanaservicios on plantel.id_m = manzanaservicios.id_plantel inner JOIN servicios on manzanaservicios.id_servicio = servicios.id_s where usuario.`Nombre`=? and solicitudes.`CodigoS` = servicios.id_s',[usuario])
        console.log(solicitudata);
        res.json({solicitudes: solicitudata.map(raw=> ([raw.fecha, raw.Nombre]))});
        await conec.end()
    }
    catch(error){
        console.error('Error en el servidor',error)
        res.status(500).send('Error en el servidor')
    }
})
//Eliminar servicios seleccionados
app.post('/eliminar-servicios-usuario',async(req,res)=>{
    const {usuario,registros,solicitudes}=req.body;
    const conec=await mysql.createConnection(db);
    const[idsolicitud]=await conec.query('SELECT solicitudes.id_sol FROM solicitudes INNER JOIN usuario ON usuario.id=solicitudes.id_so INNER JOIN plantel ON plantel.id_m=usuario.id_p1 INNER JOIN manzanaservicios ON manzanaservicios.id_plantel=plantel.id_m INNER JOIN servicios ON servicios.id_s=manzanaservicios.id_servicio WHERE usuario.nombre=?',[usuario]);
    console.log(idsolicitud[0]);
    console.log("Se ha eliminado la solicitud seleccionada");
    try{
        for(const soli of solicitudes){
        await conec.execute('DELETE FROM solicitudes WHERE id_sol=?',[idsolicitud[0].id_sol]);
        }
        await conec.end();
    }
    catch(error){
        console.error('Error en el servidor',error);
        res.status(500).send('Error en el servidor');
    }
})*/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*css*/`
    //Admin

//Mostrar usuarios registrados
    app.post('/mostrar-usuarios',async (req,res)=>{
        const usuario=req.session.usuario                                                                                                                    
        try{
            const conec=await mysql.createConnection(db)
            const[usuariosData]= await conec.execute('select * from usuario where rol="usuario"')
            console.log(usuariosData)
        //Enviar los datos al cliente
                res.json({usuariosGuardados: usuariosData.map(rsw =>([rsw.Id, rsw.Nombre,rsw.Tipo,rsw.Documento,rsw.Manzana]))})
                await conec.end()
            }
        catch(error){
            console.log('Error en el servidor:', error);
            res.status(500).send('Error en el servidor');
        }
    })

//Eliminar usuario
    app.post('/eliminar-usuario',async(req,res)=>{
        const {usuario}=req.body
        console.log("Echeeeeeeeeeee",usuario)
        try{
            const conec =await mysql.createConnection(db)

            await conec.query('DELETE FROM solicitudes WHERE solicitudes.Id1=?',[usuario]);
            await conec.query('DELETE FROM usuario WHERE usuario.Id = ?',[usuario]);
            res.status(200).send("melo XD")
            await conec.end();
            
        }
        catch(error){
            console.error('Error en el servidor',error);
            res.status(500).send('Error en el servidor');
        }
    })

    //Editar manzanas
    app.post('/editar-manzanas',async (req,res)=>{
        const plantel=req.session.plantel                                                                                                                    
        try{
            const conec=await mysql.createConnection(db)
            const[manzanasdata]= await conec.execute('select * from plantel')
            console.log(manzanasdata)
        //Enviar los datos al cliente
                res.json({manzanasguardadas: manzanasdata.map(rsw =>([rsw.Id_M,rsw.Nombre,rsw.Dir]))})
                await conec.end()
            }
        catch(error){
            console.log('Error en el servidor:', error);
            res.status(500).send('Error en el servidor');
        }
    })

    app.post('/guardar-manzana-editada',async(req,res)=>{
        const plantel=req.session.plantel
        const {planteles,Dir,Nombre}=req.body
        console.log(plantel)
        try{
            const conec=await mysql.createConnection(db)
            await conec.execute('INSERT INTO plantel(Nombre,Dir) VALUES (?,?)',[Nombre,Dir]);
            res.status(200).send('Manzana guardada exitosamente')
            await conec.end();
        }
        catch(error){
            console.log("Error guardando servicios",error)
        }
    })


app.post('/cerrar-sesion',(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.error('Error al cerrar sesion:',err);
            res.status(500).send("Error al cerrar sesion")
        }
     else{
            res.status(200).send("Sesión cerrada correctamente")
        }   
    })
})

app.listen(3000,()=>{
    console.log("Servidor node escuchando");
})
