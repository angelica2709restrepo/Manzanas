const express=require('express');
const bodyParser=require('body-parser');
const mysql=require('mysql');
const bodyParser = require('body-parser');
const app=express();
//Configurar middleware
app.use(bodyParser.urlencoded({extended:true}))//Conexion entre los paquetes
app.use(bodyParser.json());//Convertir formato
app.use(express.static(__dirname));//Opcional

const db=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'prueba',
});
db.connect((err)=>{
    if (err){
        console.error('Error al conectar la base de datos'+err.stack);
        return;
    }
    console.log('Conexion exitosa a la base de datos');
});

app.post('/crear',(req,res)=>{
    const {Nombre,Tipo,Documento}=req.body;
    const insertQuery= `INSERT INTO usuario (Nombre,Tipo,Documento) VALUES (?,?,?)`;
    db.query(insertQuery,[Nombre,Tipo,Documento],(err,result)=>{
        console.log('Datos insertados correctamente');
        res.status(200).send(`Ok :)`);
        if (err){
            console.error('Error al insertar datos'+err.stack);
            res.status(500).send('Error interno del servidor');
            return;
        }
    });


});

app.listen(3000,()=>{
    console.log('Servidor node escuchando');
})