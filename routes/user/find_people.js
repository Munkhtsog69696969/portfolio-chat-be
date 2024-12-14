const express = require('express');
const router = express.Router();
const User = require('../../models/User.schema');

// GET find_people
router.get('/', async (req, res) => {
  const userId = req.user.id; 
  const { search_name } = req.query;

  try {
    if (!search_name) {
      return res.status(400).json({ message: 'Search name is required' });
    }

    // Fetch users excluding the current user and matching the search term
    const people = await User.find({
      _id: { $ne: userId },
      name: { $regex: search_name, $options: 'i' },
    }).select('-password -servers');

    // console.log(people[0]?.friendRequests); // Debug log for friendRequests

    // Map over people to add `friends` and `pending` properties
    const result = people.map(person => {
      const isFriend = person.friends?.map(id => id.toString()).includes(userId) || false;
      const isPending = person.friendRequests?.map(id => id.toString()).includes(userId) || false;

      return {
        ...person.toObject(), 
        friends: isFriend,
        pending: isPending,
      };
    });

    // Send the result in the response
    res.status(200).json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
