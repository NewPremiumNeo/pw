import express from 'express';
const router = express.Router();
import { paidBatches, freeBatches, specificeBatch, subjectListDetails, videosBatch, videoNotes, dppQuestions, dppVideos } from '../controllers/pw.js';
// Your main file
import { findKey, findKey2 } from '../controllers/keyFinder.js';
import authLogin from '../middlewares/auth.js';
import { saveDataToMongoDB, saveAllDataToMongoDB, saveChapterData } from '../controllers/saveBatch.js';
// import saveDataToMongoDB from '../controllers/new.js';
import updateDataToMongoDB from '../controllers/updateBatch.js'
import { Batch, Subject, Chapter, Video, Note } from '../models/batches.js'
import { convertMPDToHLS, multiQualityHLS } from '../controllers/hls.js'


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Kuch nahi Yrr' });
});

router.get('/logout', function (req, res, next) {
  const token = req.cookies.token;
  if (token) {
    res.cookie('token', 'logout', { maxAge: 604800000, httpOnly: true });
  }
  res.redirect('/login');
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', async function (req, res, next) {
  const token = req.body.token;
  if (!token) res.send("<script>alert('Please Enter Token'); window.location.href='/login';</script>");
  const url = 'https://api.penpencil.co/v3/oauth/verify-token';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    "Accept": "application/json, text/plain, */*",
    "randomId": "344163b-ebef-ace-8fa-2a1c8863fd5a"
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers
    });
    const data = await response.json();
    if (data.success) {
      res.cookie('token', token, { maxAge: 604800000, httpOnly: true });
      res.redirect('/batches');
    } else {
      res.send("<script>alert('Token Expried'); window.location.href='/login';</script>");
      res.redirect('/login');
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
});


router.get('/batches', authLogin, async function (req, res, next) {
  const token = req.cookies.token;
  saveAllDataToMongoDB(token)
  const paidBatch = await paidBatches(token)
  const freeBatch = await freeBatches(token)
  res.render('batch', { paidBatch, freeBatch });
});

router.get('/batches/save/:batchSlug', authLogin, async function (req, res, next) {
  const token = req.cookies.token;
  const batchSlug = req.params.batchSlug;
  await saveDataToMongoDB(token, batchSlug);
  res.send('Saved')
});

router.get('/batches/update/:batchSlug', authLogin, async function (req, res, next) {
  const token = req.cookies.token;
  const batchSlug = req.params.batchSlug;
  await updateDataToMongoDB(token, batchSlug);
  res.send('Updated')
});

router.get('/batches/:batchNameSlug/details', authLogin, async function (req, res, next) {
  const token = req.cookies.token;
  const specificeBatchdata = await specificeBatch(token, req.params.batchNameSlug)
  res.render('batchesDetails', { specificeBatch: specificeBatchdata, batchNameSlug: req.params.batchNameSlug });
});

router.get('/batches/:batchNameSlug/subject/:subjectSlug/topics', authLogin, async function (req, res, next) {
  const token = req.cookies.token;
  const subjectListDetailsData = await subjectListDetails(token, req.params.batchNameSlug, req.params.subjectSlug)
  res.render('subjectListDetails', { subjectListDetails: subjectListDetailsData, batchNameSlug: req.params.batchNameSlug, subjectSlug: req.params.subjectSlug });
});

router.get('/batches/:batchNameSlug/subject/:subjectSlug/topics/save', authLogin, async function (req, res, next) {
  const token = req.cookies.token;
  await saveChapterData(token, req.params.batchNameSlug, req.params.subjectSlug, 1)
  res.status(200).send('Saved');
});

router.get('/batches/:batchNameSlug/subject/:subjectSlug/contents/:chapterSlug', authLogin, async function (req, res, next) {
  const token = req.cookies.token;
  const videosBatchData = await videosBatch(token, req.params.batchNameSlug, req.params.subjectSlug, req.params.chapterSlug)
  res.render('videosBatch', { videosBatch: videosBatchData, batchNameSlug: req.params.batchNameSlug, subjectSlug: req.params.subjectSlug, chapterSlug: req.params.chapterSlug });
});

router.get('/batches/:batchNameSlug/subject/:subjectSlug/contents/:chapterSlug/:contentType', authLogin, async function (req, res, next) {
  const token = req.cookies.token;
  const contentType = req.params.contentType;
  switch (contentType) {
    case "lectures":
      const videosBatchData = await videosBatch(token, req.params.batchNameSlug, req.params.subjectSlug, req.params.chapterSlug)
      return res.status(200).json(videosBatchData);
      break;
    case "notes":
      const videoNotesData = await videoNotes(token, req.params.batchNameSlug, req.params.subjectSlug, req.params.chapterSlug)
      return res.status(200).json(videoNotesData);
      break;
    case "dpp":
      const dppQuestionsData = await dppQuestions(token, req.params.batchNameSlug, req.params.subjectSlug, req.params.chapterSlug)
      return res.status(200).json(dppQuestionsData);
      break;
    case "dppVideos":
      const dppVideosData = await dppVideos(token, req.params.batchNameSlug, req.params.subjectSlug, req.params.chapterSlug)
      return res.status(200).json(dppVideosData);
      break;

    default:
      break;
  }
  const videosBatchData = await videosBatch(token, req.params.batchNameSlug, req.params.subjectSlug, req.params.chapterSlug)
  return res.render('videosBatch', { videosBatch: videosBatchData });
});


router.get('/hls', async function (req, res, next) {
  try {
    const vidID = req.query.v;
    const quality = req.query.quality;
    console.log(vidID, quality)
    const data = await convertMPDToHLS(vidID, quality)
    res.setHeader('Content-Type', 'application/x-mpegurl; charset=utf-8');
    res.send(data);

  } catch (error) {
    res.status(403).send("HLS Error: " + error.message);
  }
})

router.get('/download/:vidID/master.m3u8', async function (req, res, next) {
  try {
    const vidID = req.params.vidID;
    const data = await multiQualityHLS(vidID);

    // Set the required headers
    res.setHeader('Content-Type', 'application/x-mpegurl; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="PKV_play.m3u8"');
    
    // Send the response
    res.send(data);
  } catch (error) {
    res.status(403).send("HLS Error: " + error.message);
  }
});

router.get('/get-hls-key', async (req, res) => {
  const videoKey = req.query.id;
  const url = `https://api.penpencil.co/v1/videos/get-hls-key?videoKey=${videoKey}&key=enc.key`;
  // const url2 = `https://dl.pwjarvis.com/api/get-hls-key?id=${videoKey}`;
  const headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjE0NDM3MjUuMzY0LCJkYXRhIjp7Il9pZCI6IjY2N2EyNjVmMTg0NDlkMDY3MDgzZmZmYiIsInVzZXJuYW1lIjoiOTIzNTczNjAwNCIsImZpcnN0TmFtZSI6Ik5pdGluIiwibGFzdE5hbWUiOiJHdXB0YSIsIm9yZ2FuaXphdGlvbiI6eyJfaWQiOiI1ZWIzOTNlZTk1ZmFiNzQ2OGE3OWQxODkiLCJ3ZWJzaXRlIjoicGh5c2ljc3dhbGxhaC5jb20iLCJuYW1lIjoiUGh5c2ljc3dhbGxhaCJ9LCJyb2xlcyI6WyI1YjI3YmQ5NjU4NDJmOTUwYTc3OGM2ZWYiLCI1Y2M5NWEyZThiZGU0ZDY2ZGU0MDBiMzciXSwiY291bnRyeUdyb3VwIjoiSU4iLCJ0eXBlIjoiVVNFUiJ9LCJpYXQiOjE3MjA4Mzg5MjV9.UiB2lKO2Tka6lhhnvSmQVPrBl8BAImng5gSsX0fIE0g",
    "User-Agent": "Mozilla/5.0 (Linux; Android 13; 22031116AI Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.134 Mobile Safari/537.36"
  };
  
  try {
    const response = await fetch(url, { headers });
    const data = await response.text();
    console.log(data)
    res.setHeader('Content-Type', 'binary/octet-stream');
    res.setHeader('Vary', 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept-Encoding');
    res.send(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

router.get('/play', async function (req, res, next) {
  let videoUrl = req.query.videoUrl;
  try {
    // let key = await findKey(videoUrl)
    let key = null;
    if (key && key.kid && key.k) {
      res.render('player', { videoUrl, key });
    } else {
      res.render('player3', { videoUrl })
    }
  } catch (error) {
    res.status(403).send("Server Error: " + error.message);
  }
});


router.get('/saved/Batches', async function (req, res, next) {
  const batch = await Batch.find().select('-subjects');
  res.render('savedBatch', { batch });
});
router.get('/saved/batches/:batchNameSlug/details', async function (req, res, next) {
  const specificeBatchdata = await Batch.findOne({ slug: req.params.batchNameSlug }).select('-subjects.chapters');
  res.render('savedBatchesDetails', { specificeBatch: specificeBatchdata, batchNameSlug: req.params.batchNameSlug });
});
router.get('/saved/batches/:batchNameSlug/subject/:subjectSlug/topics', async function (req, res, next) {
  const batch = await Batch.findOne({ slug: req.params.batchNameSlug }).select('-subjects.chapters.videosSch -subjects.chapters.notesSch -subjects.chapters.dppVideosSch -subjects.chapters.dppSch');
  if (batch) {
    const subjectListDetailsData = batch.subjects.find(sub => sub.slug === req.params.subjectSlug);
    res.render('savedSubjectListDetails', { subjectListDetails: subjectListDetailsData, batchNameSlug: req.params.batchNameSlug, subjectSlug: req.params.subjectSlug });
  } else {
    res.status(404).json({ message: "Batch not found" });
  }
});
router.get('/saved/batches/:batchNameSlug/subject/:subjectSlug/contents/:chapterSlug', async function (req, res, next) {
  const batch = await Batch.findOne({ slug: req.params.batchNameSlug });
  const subjectListDetailsData = batch.subjects.find(sub => sub.slug === req.params.subjectSlug);
  const videosBatchData = subjectListDetailsData.chapters.find(sub => sub.slug === req.params.chapterSlug);
  // const videosBatchData = await videosBatch(token, req.params.batchNameSlug, req.params.subjectSlug, req.params.chapterSlug)
  res.render('savedVideosBatch', { videosBatch: videosBatchData, batchNameSlug: req.params.batchNameSlug, subjectSlug: req.params.subjectSlug, chapterSlug: req.params.chapterSlug });
});

router.get('/saved/batches/:batchNameSlug/subject/:subjectSlug/contents/:chapterSlug/:contentType', async function (req, res, next) {
  const batch = await Batch.findOne({ slug: req.params.batchNameSlug });
  const subjectListDetailsData = batch.subjects.find(sub => sub.slug === req.params.subjectSlug);
  const videosBatchData = subjectListDetailsData.chapters.find(sub => sub.slug === req.params.chapterSlug);
  res.json(videosBatchData)
});



export default router;
