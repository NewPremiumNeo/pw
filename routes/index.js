import express from 'express';
const router = express.Router();
import { paidBatches, freeBatches, specificeBatch, subjectListDetails, videosBatch, videoNotes, dppQuestions, dppVideos } from '../controllers/pw.js';
// Your main file
import findKey from '../controllers/keyFinder.js';
import authLogin from '../middlewares/auth.js';

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Kuch nahi Yrr' });
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', async function (req, res, next) {
  const token = req.body.token;
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
      res.cookie('token', token, { maxAge: 900000, httpOnly: true });
      res.redirect('/batches');
    } else {
      res.send("Token Expire");
      res.redirect('/login');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});


router.get('/batches', authLogin, async function (req, res, next) {
  const token = req.cookies.token;
  const paidBatch = await paidBatches(token)
  const freeBatch = await freeBatches(token)
  res.render('batch', { paidBatch, freeBatch });
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

router.get('/batches/:batchNameSlug/subject/:subjectSlug/contents/:chapterSlug', authLogin, async function (req, res, next) {
  const token = req.cookies.token;
  const videosBatchData = await videosBatch(token, req.params.batchNameSlug, req.params.subjectSlug, req.params.chapterSlug)
  res.render('videosBatch', { videosBatch: videosBatchData, batchNameSlug: req.params.batchNameSlug, subjectSlug: req.params.subjectSlug, chapterSlug: req.params.chapterSlug});
});

router.get('/batches/:batchNameSlug/subject/:subjectSlug/contents/:chapterSlug/:contentType', authLogin, async function (req, res, next) {
  const token = req.cookies.token;
  const contentType = req.params.contentType;
  console.log(contentType)
  switch (contentType) {
    case "lectures":
      const videosBatchData = await videosBatch(token, req.params.batchNameSlug, req.params.subjectSlug, req.params.chapterSlug)
      res.json(videosBatchData);
      break;
    case "notes":
      const videoNotesData = await videoNotes(token, req.params.batchNameSlug, req.params.subjectSlug, req.params.chapterSlug)
      res.json(videoNotesData);
      break;
    case "dpp":
      const dppQuestionsData = await dppQuestions(token, req.params.batchNameSlug, req.params.subjectSlug, req.params.chapterSlug)
      res.json(dppQuestionsData);
      break;
    case "dppVideos":
      const dppVideosData = await dppVideos(token, req.params.batchNameSlug, req.params.subjectSlug, req.params.chapterSlug)
      console.log(dppVideosData)
      res.json(dppVideosData);
      break;
  
    default:
      break;
  }
  const videosBatchData = await videosBatch(token, req.params.batchNameSlug, req.params.subjectSlug, req.params.chapterSlug)
  res.render('videosBatch', { videosBatch: videosBatchData });
});

router.get('/play', async function (req, res, next) {
  let videoUrl = req.query.videoUrl;
  const key = await findKey(videoUrl)
  res.render('player', { videoUrl, key });
});

export default router;
