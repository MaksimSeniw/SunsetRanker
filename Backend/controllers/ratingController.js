const { Rating } = require('../models');

exports.submitRating = async (req, res) => {
  console.log('Rating Controller: Entering submitRating function.');

  try {

    const { photoId } = req.params;
    const { score } = req.body; 

    const userId = req.userId; 

    console.log('Rating Controller: Received photoId:', photoId);
    console.log('Rating Controller: Received score:', score);
    console.log('Rating Controller: Extracted userId:', userId);


    if (!photoId) {
      return res.status(400).json({ message: 'photoId is required in URL parameters.' }); //Checks
    }
    if (score === undefined || score === null) {
      return res.status(400).json({ message: 'Score is required in the request body.' });
    }
    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }
    if (!userId) { 
      console.error('Rating Controller: userId is null or undefined. Auth middleware likely failed or not applied.');
      return res.status(401).json({ message: 'Authentication required. User ID not found.' });
    }

    const existingRating = await Rating.findOne({ //Checking if user already rated the sunset
      where: {
        userId,
        photoId
      }
    });

    if (existingRating) {
      return res.redirect('/new?message=You+have+already+rated+this+sunset!'); //Redirecting
    }

    const rating = await Rating.create({ //Creating the rating and putting it in the db
      photoId: photoId, 
      userId: userId,   
      score: score
    });

  res.redirect('/new?message=Rating+submitted+successfully!');

  } catch (err) {
    console.error('Rating Controller: Failed to submit rating. Error details:', err.message);
    res.status(500).json({ error: 'Rating failed', details: err.message });
  }
};