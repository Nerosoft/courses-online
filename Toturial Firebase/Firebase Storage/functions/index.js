const functions = require('firebase-functions');
const espress = require("express");
//npm i handlebars consolidate --save
const engines = require('consolidate');
const handlebars = require('handlebars');

const Busboy = require('busboy');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');


var app = espress();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.set('views', './views');
app.engine('hbs', engines.handlebars);
app.set('view engine', 'hbs');

app.use(espress.static('./views'))


const serviceAccount = require("./serviceAccountKey.json");




var config = {
  projectId: 'toturial-firebase2020',
  keyFilename: '/functions/serviceAccountKey.json',
  credentials: serviceAccount
};

const storage = new Storage(config);
const bucket = storage.bucket('toturial-firebase2020.appspot.com/');

let MYALLIMAGE = []

function getAllImage() {

  MYALLIMAGE = []
  bucket.getFiles().then((data) => {
    const files = data[0];

    return files.forEach(file => {
      const get_metadata = file.metadata

      file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491'
      }).then(signedUrls => {

        return MYALLIMAGE.push(
          {
            url: signedUrls[0],
            title: get_metadata.metadata.title,
            alt: get_metadata.metadata.alt,
            type: get_metadata.metadata.type
          })

      }).catch(error => { });
    })

  }).catch(error => { })
}

getAllImage()

app.get('/abdullah', (request, response) => {
  response.send(MYALLIMAGE);
});


app.get('/upload', (req, res) => {
  res.render("hello");
});

handlebars.registerHelper('times', function (n, block) {
  var accum = '';
  for (var i = 0; i < MYALLIMAGE.length; ++i) {
    block.data.url = MYALLIMAGE[i].url;
    block.data.title = MYALLIMAGE[i].title;
    block.data.alt = MYALLIMAGE[i].alt;
    accum += block.fn(i);

  }

  return accum;
});

app.get('/display', (req, res) => {
  res.render("display");
});

app.post('/upload', filesUpload, (req, res) => {

  if (!req.files) {
    console.log("No file received");
    return res.send({
      success: false
    });

  } else {
    console.log('file received');
    let formInfo = req.body
    let images = req.files
    
    for (let index = 0; index < images.length; index++) {
      let image = images[index]
      saveImage(formInfo.title, formInfo.alt, image.originalname, image.buffer, image.type)
    }



    res.send({ state: true })
  }

});


function saveImage(title, alt, name, file, type) {
  bucket.file(name).save(file, {
    resumable: false,
    metadata: {
      contentType: type,

      metadata: {
        title: title,
        alt: alt,
        type: type
      }
    }

  }).then(() => {

     saveToMyIMage(name)
     return
    
  }).catch(error => { saveToMyIMage(name)})


}


async function saveToMyIMage(name) {

  const linkBucket = storage.bucket('toturial-firebase2020.appspot.com/');
  let spaceRef = linkBucket.file(name);
  const [get_metadata] = await spaceRef.getMetadata()


  spaceRef.getSignedUrl({
    action: 'read',
    expires: '03-09-2491'
  }).then(signedUrls => {
    MYALLIMAGE.push({
      url: signedUrls[0],
      title: get_metadata.metadata.title,
      alt: get_metadata.metadata.alt,
      type: get_metadata.metadata.type
    })
    return
  }).catch(error => { })

}


function filesUpload(req, res, next) {
  // See https://cloud.google.com/functions/docs/writing/http#multipart_data
  const busboy = new Busboy({
    headers: req.headers,
    limits: {
      // Cloud functions impose this restriction anyway
      fileSize: 10 * 1024 * 1024,
    }
  });

  const fields = {};
  const files = [];
  const fileWrites = [];
  // Note: os.tmpdir() points to an in-memory file system on GCF
  // Thus, any files in it must fit in the instance's memory.
  const tmpdir = os.tmpdir();

  busboy.on('field', (key, value) => {
    // You could do additional deserialization logic here, values will just be
    // strings
    fields[key] = value;
  });

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    const filepath = path.join(tmpdir, filename);
    console.log(`Handling file upload field ${fieldname}: ${filename} (${filepath})`);
    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);

    fileWrites.push(new Promise((resolve, reject) => {
      file.on('end', () => writeStream.end());
      writeStream.on('finish', () => {
        fs.readFile(filepath, (err, buffer) => {
          const size = Buffer.byteLength(buffer);
          console.log(`${filename} is ${size} bytes`);
          if (err) {
            return reject(err);
          }

          files.push({
            fieldname,
            originalname: filename,
            encoding,
            mimetype,
            buffer,
            size,
          });

          try {
            fs.unlinkSync(filepath);
          } catch (error) {
            return reject(error);
          }

          resolve();
        });
      });
      writeStream.on('error', reject);
    }));
  });

  busboy.on('finish', () => {
    Promise.all(fileWrites)
      .then(() => {
        req.body = fields;
        req.files = files;
        next();
        return

      })
      .catch(next);
  });

  busboy.end(req.rawBody);
}


exports.abdo = functions.https.onRequest(app);



//const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });











//"@google-cloud/storage": "^5.1.2",