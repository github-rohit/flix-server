import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'bson';
import UsersDAO from '../dao/usersDAO';
import CommentsDAO from '../dao/commentsDAO';
import MoviesDAO from '../dao/moviesDAO';
import { User } from './users.controller';

export default class CommentsController {
  static async apiPostComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userJwt = req.get('Authorization')?.slice('Bearer '.length) || '';
      const user: any = await User.decoded(userJwt);
      var { error } = user;
      if (error) {
        res.status(401).json({ error });
        return;
      }

      const movieId = req.body.movie_id;
      const comment = req.body.comment;
      const date = new Date();

      const commentResponse = await CommentsDAO.addComment(
        (ObjectId as any)(movieId),
        user,
        comment,
        date
      );

      const updatedComments = await MoviesDAO.getMovieByID(movieId);

      res.json({ status: 'success', comments: updatedComments.comments });
    } catch (e) {
      res.status(500).json({ e });
    }
  }

  static async apiUpdateComment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userJwt = req.get('Authorization')?.slice('Bearer '.length) || '';
      const user: any = await User.decoded(userJwt);
      var { error } = user;
      if (error) {
        res.status(401).json({ error });
        return;
      }

      const commentId = req.body.comment_id;
      const text = req.body.updated_comment;
      const date = new Date();

      const commentResponse = await CommentsDAO.updateComment(
        (ObjectId as any)(commentId),
        user.email,
        text,
        date
      );

      var { error } = commentResponse;
      if (error) {
        res.status(400).json({ error });
      }

      if (commentResponse.modifiedCount === 0) {
        throw new Error(
          'unable to update comment - user may not be original poster'
        );
      }

      const movieId = req.body.movie_id;
      const updatedComments = await MoviesDAO.getMovieByID(movieId);

      res.json({ comments: updatedComments.comments });
    } catch (e) {
      res.status(500).json({ e });
    }
  }

  static async apiDeleteComment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userJwt = req.get('Authorization')?.slice('Bearer '.length) || '';
      const user: any = await User.decoded(userJwt);
      var { error } = user;
      if (error) {
        res.status(401).json({ error });
        return;
      }

      const commentId = req.body.comment_id;
      const userEmail = user.email;
      const commentResponse = await CommentsDAO.deleteComment(
        (ObjectId as any)(commentId),
        userEmail
      );

      const movieId = req.body.movie_id;

      const { comments } = await MoviesDAO.getMovieByID(movieId);
      res.json({ comments });
    } catch (e) {
      res.status(500).json({ e });
    }
  }

  static async apiCommentReport(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userJwt = req.get('Authorization')?.slice('Bearer '.length) || '';
      const user: any = await User.decoded(userJwt);
      var { error } = user;
      if (error) {
        res.status(401).json({ error });
        return;
      }

      if (UsersDAO.checkAdmin(user.email)) {
        const report = await CommentsDAO.mostActiveCommenters();
        res.json({ report });
        return;
      }

      res.status(401).json({ status: 'fail' });
    } catch (e) {
      res.status(500).json({ e });
    }
  }
}
