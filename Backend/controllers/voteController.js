const Vote = require('../models/Vote');
const Issue = require('../models/Issue');

// Vote on an issue
exports.voteOnIssue = async (req, res) => {
  try {
    const { type } = req.body;
    
    if (!['upvote', 'downvote'].includes(type)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    const issue = await Issue.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    let vote = await Vote.findOne({ 
      user: req.user.id, 
      issue: req.params.issueId 
    });

    if (vote) {
      if (vote.type !== type) {
        if (vote.type === 'upvote') {
          issue.upvotes -= 1;
        } else {
          issue.downvotes -= 1;
        }
        
        if (type === 'upvote') {
          issue.upvotes += 1;
        } else {
          issue.downvotes += 1;
        }
        
        vote.type = type;
        await vote.save();
        await issue.save();
      }
      
      return res.json({ vote, issue });
    }

    vote = new Vote({
      user: req.user.id,
      issue: req.params.issueId,
      type
    });

    if (type === 'upvote') {
      issue.upvotes += 1;
    } else {
      issue.downvotes += 1;
    }

    await vote.save();
    await issue.save();

    res.json({ vote, issue });
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already voted on this issue' });
    }
    res.status(500).send('Server error');
  }
};

// Get votes for an issue
exports.getVotesByIssue = async (req, res) => {
  try {
    const votes = await Vote.find({ issue: req.params.issueId })
      .populate('user', 'name');
    
    res.json(votes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get user's votes
exports.getUserVotes = async (req, res) => {
  try {
    const votes = await Vote.find({ user: req.user.id })
      .populate({
        path: 'issue',
        select: 'title status category'
      });
    
    res.json(votes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};