from flaskforum import db, bcrypt, app
from flask import Blueprint, request, jsonify, make_response, render_template, url_for, send_file, current_app, redirect
from flaskforum.models import *
from flaskforum.api.schema import *
from flaskforum.api.validators import input_validator
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask_login import current_user
from PIL import Image
import os
import secrets

"""
POSTMAN SETTINGS
Headers required : 
    'x-access-token : (token_value) - methods: POST, PUT, DELETE
    'Content-Type : application/json' - methods: POST, PUT
Body required: 
    'raw,JSON' - methods: POST, PUT
Authorization:
    'Basic Auth'
"""

api = Blueprint('api', __name__)

# TOKEN
# give token to user that login with valid details
@api.route('/api/login', methods=['GET'])
def api_login():
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return jsonify({'message': 'Unauthorized Access'}), 401
    user = db.session.query(User).filter(db.func.lower(User.username)==db.func.lower(auth.username)).first()
    if not user:
        return jsonify({ 'error': {'username': 'User does not exist'}}), 401
    if bcrypt.check_password_hash(user.password, auth.password):
        token = jwt.encode({'id': user.id, 'exp': datetime.utcnow() + timedelta(minutes=1440)}, app.config['SECRET_KEY'])
        return jsonify({'token': token.decode('UTF-8')})
    return jsonify({ 'error': {'password': 'Password does not match with this username'}}), 401


def token_required(verify_token):  # verify token that has been given
    @wraps(verify_token)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'])
            user = User.query.filter_by(id=data['id']).first()
        except:
            return jsonify({'message': 'Invalid Token'}), 401
        return verify_token(user, *args, **kwargs)
    return decorated

# POST METHODS
@api.route('/api/post', methods=['POST'])
@token_required
def api_create_post(c_user):
    data = request.get_json()
    try:
        title = data['title'].strip()
        content = data['content'].strip()
        forum_id = data['forum_id']
        errors = dict()
        input_validator.validPostTitle(title, errors)
        input_validator.validPostContent(content, errors)
        if len(errors) > 0:
            return jsonify(errors)
    except:
        return jsonify({'message': 'Invalid request'}), 400
    forum = Forum.query.get(forum_id)
    if forum is None:
        return jsonify({'message': 'Invalid request'}), 400
    post = Post(title=title, content=content, forum_id=forum_id, user_id=c_user.id)
    db.session.add(post)
    forum.num_of_post += 1
    db.session.commit()
    result = post_schema.dump(post)
    return jsonify({'post': result})

@api.route('/api/comment', methods=['POST'])
@token_required
def api_create_comment(c_user):
    data = request.get_json()
    try:
        content = data['content'].strip()
        post_id = data['post_id']
        errors = dict()
        input_validator.validCommentContent(content, errors)
        if len(errors) > 0:
            return jsonify(errors)
    except:
        return jsonify({'message': 'Invalid request'}), 400
    post = Post.query.get(post_id)
    if post is None:
        return jsonify({'message': 'Invalid request'}), 400
    comment = Comment(content=content, post_id=post_id, user_id=c_user.id)
    db.session.add(comment)
    post.num_of_comments += 1
    db.session.commit()
    user = user_schema.dump(comment.comment_user)
    post = forum_schema.dump(comment.comment_post)
    return jsonify({'comment': {'id': comment.id, 'content': comment.content, 'date_commented': comment.date_commented, 'num_of_reply':comment.num_of_reply, 'user': user, 'post':post}})

@api.route('/api/reply', methods=['POST'])
@token_required
def api_create_reply(c_user):
    data = request.get_json()
    try:
        content = data['content'].strip()
        comment_id = data['comment_id']
        errors = dict()
        input_validator.validReplyContent(content, errors)
        if len(errors) > 0:
            return jsonify(errors)
    except:
        return jsonify({'message': 'Invalid request'}), 400
    comment = Comment.query.get(comment_id)
    if comment is None:
        return jsonify({'message': 'Invalid request'}), 400
    reply = Reply(content=content, comment_id=comment_id, user_id=c_user.id)
    db.session.add(reply)
    comment.num_of_reply += 1
    db.session.commit()
    user = user_schema.dump(reply.reply_user)
    comment = forum_schema.dump(reply.reply)
    return jsonify({'reply': {'id': reply.id, 'content': reply.content, 'date_reply': reply.date_reply, 'user': user, 'comment':comment}})

@api.route('/api/forum', methods=['POST'])
@token_required
def api_create_forum(c_user):
    data = request.get_json()
    try:
        name = data['name'].strip()
        about = data['about'].strip()
        errors = dict()
        input_validator.validForumName(name, errors)
        input_validator.validForumAbout(about, errors)
        if len(errors) > 0:
            return jsonify(errors)
    except:
        return jsonify({'message': 'Invalid request'}), 400
    exist = db.session.query(Forum).filter(db.func.lower(Forum.name)==db.func.lower(name)).first()
    if exist:
        return jsonify({'error': {'name': 'Forum name already exist'}}), 401
    forum = Forum(name=name, about=about, owner_id=c_user.id)
    db.session.add(forum)
    db.session.commit()
    result = forum_schema.dump(forum)
    return jsonify({'forum': result})

@api.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()
    try:
        username = data['username'].strip()
        email = data['email'].strip()
        password = data['password']
        errors = dict()
        input_validator.validUsername(username, errors)
        input_validator.validEmail(email, errors)
        input_validator.validPassword(password, errors)
        if len(errors) > 0:
            return jsonify(errors)
        user = db.session.query(User).filter(db.func.lower(User.username)==db.func.lower(username)).first()
        if not user:
            hash_password = bcrypt.generate_password_hash(password).decode('utf-8')
            user = User(username=username, email=email, password=hash_password)
            db.session.add(user)
            db.session.commit()
            result = user_schema.dump(user)
            return jsonify({'user' : result})
        else:
            return jsonify({ 'error': {'username': 'User already exists'}}), 401
    except:
        return jsonify({'message':'Invalid request'}), 400
    return jsonify({'message':'Invalid request'}), 400

@api.route('/api/user/follow/<int:id>', methods=['POST'])
@token_required
def follow_forum(c_user, id):
    forum = Forum.query.filter_by(id=id).first()
    follow = User.query.filter_by(id=c_user.id).first().follow.filter_by(id=id).first()
    if follow:
        return jsonify({'message' : 'User is already following'}), 400
    Forum.query.filter_by(id=id).first().follow_forum.append(c_user)
    forum.followers += 1
    db.session.commit()
    result  = forum_schema.dump(forum)
    return jsonify({'forum' : result})

@api.route('/api/update_forum_image/<int:id>', methods=['POST'])
@token_required
def update_forum_image(c_user, id):
    forum = Forum.query.filter_by(id=id, owner_id=c_user.id).first()
    if forum is None:
        return jsonify({'message': 'Invalid request'}), 400
    image = request.files['file']
    if image is None:
        return jsonify({'message': 'Invalid request'}), 400
    file_name = save_image(image, 'forum_pics')
    if file_name is None:
        return jsonify({'message': 'Invalid request'}), 400
    if forum.display_picture != 'default.png':
        file_path = os.path.join(app.root_path, f'static/forum_pics', forum.display_picture)
        os.remove(file_path)
    forum.display_picture = file_name
    db.session.commit()
    return jsonify({'filename': file_name})

@api.route('/api/update_user_image', methods=['POST'])
@token_required
def update_user_image(c_user):
    image = request.files['file']
    if image is None:
        return jsonify({'message': 'Invalid request'}), 400
    file_name = save_image(image, 'user_pics')
    if file_name is None:
        return jsonify({'message': 'Invalid request'}), 400
    if c_user.display_picture != 'default.png':
        file_path = os.path.join(app.root_path, f'static/user_pics', c_user.display_picture)
        os.remove(file_path)
    c_user.display_picture = file_name
    db.session.commit()
    return jsonify({'filename': file_name})

# PUT METHODS
@api.route('/api/post/<int:id>', methods=['PUT'])
@token_required
def api_update_post(c_user, id):
    post = Post.query.filter_by(id=id, user_id=c_user.id).first()
    if post is None:
        return jsonify({'message': 'Invalid request'}), 400
    data = request.get_json()
    try:
        title = data['title'].strip()
        content = data['content'].strip()
        errors = dict()
        input_validator.validPostTitle(title, errors)
        input_validator.validPostContent(content, errors)
        if len(errors) > 0:
            return jsonify(errors)
    except:
        return jsonify({'message': 'Invalid request'}), 400
    post.title = title
    post.content = content
    db.session.commit()
    result = post_schema.dump(post)
    return jsonify({'post': result})

@api.route('/api/comment/<int:id>', methods=['PUT'])
@token_required
def api_update_comment(c_user, id):
    comment = Comment.query.filter_by(id=id, user_id=c_user.id).first()
    if comment is None:
        return jsonify({'message': 'Invalid request'}), 400
    data = request.get_json()
    try:
        content = data['content'].strip()
        errors = dict()
        input_validator.validCommentContent(content, errors)
        if len(errors) > 0:
            return jsonify(errors)
    except:
        return jsonify({'message': 'Invalid request'}), 400
    comment.content = content
    db.session.commit()
    result = comment_schema.dump(comment)
    return jsonify({'comment': result})

@api.route('/api/reply/<int:id>', methods=['PUT'])
@token_required
def api_update_reply(c_user, id):
    reply = Reply.query.filter_by(id=id, user_id=c_user.id).first()
    if reply is None:
        return jsonify({'message': 'Invalid request'}), 400
    data = request.get_json()
    try:
        content = data['content'].strip()
        errors = dict()
        input_validator.validReplyContent(content, errors)
        if len(errors) > 0:
            return jsonify(errors)
    except:
        return jsonify({'message': 'Invalid request'}), 400
    reply.content = content
    db.session.commit()
    result = reply_schema.dump(reply)
    return jsonify({'reply': result})

@api.route('/api/forum/<int:id>', methods=['PUT'])
@token_required
def api_update_forum(c_user, id):
    forum = Forum.query.filter_by(id=id, owner_id=c_user.id).first()
    if forum is None:
        return jsonify({'message': 'Invalid request'}), 400
    data = request.get_json()
    try:
        about = data['about'].strip()
        errors = dict()
        input_validator.validForumAbout(about, errors)
        if len(errors) > 0:
            return jsonify(errors)
    except:
        return jsonify({'message': 'Invalid request'}), 400
    forum.about = about
    db.session.commit()
    result = forum_schema.dump(forum)
    return jsonify({'forum': result})

@api.route('/api/account', methods=['PUT'])
@token_required
def api_update_account(c_user):
    data = request.get_json()
    try:
        username = data['username'].strip()
        user = db.session.query(User).filter(db.func.lower(User.username)==db.func.lower(username)).first()
        if(username.lower() != c_user.username.lower() and user):
            return jsonify({'error' : {'username' : 'User already exists'}}), 401
        email = data['email'].strip()
        errors = dict()
        input_validator.validUsername(username, errors)
        input_validator.validEmail(email, errors)
        if len(errors) > 0:
            return jsonify(errors)
        c_user.username = username
        c_user.email = email
        db.session.commit()
        result = user_schema.dump(c_user)
        return jsonify({'user' : result})
    except:
        return jsonify({'message': 'Invalid request'}), 400

@api.route('/api/account_pass', methods=['PUT'])
@token_required
def api_change_password(c_user):
    data = request.get_json()
    try:
        old_password = data['old_password']
        new_password = data['new_password']
        errors = dict()
        input_validator.validPassword(new_password, errors)
        if len(errors) > 0:
            return jsonify(errors)
        if bcrypt.check_password_hash(c_user.password, old_password):
            hash_new_pass = bcrypt.generate_password_hash(new_password).decode('utf-8')
            c_user.password = hash_new_pass
            db.session.commit()
            return jsonify({'message':'Account password has been changed'})
        else:
            return jsonify({'error': {'password':'Password is incorrect'}}), 401
    except:
        return jsonify({'message':'Invalid request'}), 400

# DELETE METHODS
@api.route('/api/post/<int:id>', methods=['DELETE'])
@token_required
def api_delete_post(c_user, id):
    post = Post.query.filter_by(id=id, user_id=c_user.id).first()
    if post is None:
        return jsonify({'message': 'Invalid request'}), 400
    comment = Comment.query.filter_by(post_id=post.id)
    reply = db.session.query(Reply).outerjoin(Comment, Comment.id == Reply.comment_id).filter(
        Comment.post_id == post.id)  # if no comment exist for this post then reply is none
    if reply:
        for r in reply:
            db.session.delete(r)
    if comment:
        comment.delete()  # delete comment all at once
    post.forum.num_of_post -= 1
    db.session.delete(post)
    db.session.commit()
    result = post_schema.dump(post)
    return jsonify({'post': result})

@api.route('/api/comment/<int:id>', methods=['DELETE'])
@token_required
def api_delete_comment(c_user, id):
    comment = Comment.query.filter_by(id=id, user_id=c_user.id).first()
    if comment is None:
        return jsonify({'message': 'Invalid request'}), 400
    reply = Reply.query.filter_by(comment_id=comment.id)
    if reply:
        reply.delete()  # dlete reply all at once
    comment.comment_post.num_of_comments -= 1
    db.session.delete(comment)
    db.session.commit()
    result = comment_schema.dump(comment)
    return jsonify({'comment': result})

@api.route('/api/reply/<int:id>', methods=['DELETE'])
@token_required
def api_delete_reply(c_user, id):
    reply = Reply.query.filter_by(id=id, user_id=c_user.id).first()
    if reply is None:
        return jsonify({'message': 'Invalid request'}), 400
    reply.reply.num_of_reply -= 1
    db.session.delete(reply)
    db.session.commit()
    result = reply_schema.dump(reply)
    return jsonify({'reply': result})

@api.route('/api/user/unfollow/<int:id>', methods=['DELETE'])
@token_required
def unfollow_forum(c_user, id):
    forum = Forum.query.filter_by(id=id).first()
    follow = User.query.filter_by(id=c_user.id).first().follow.filter_by(id=id).first()
    if follow is None:
        return jsonify({'message' : 'User is not currently following this forum'}), 400
    user = User.query.filter_by(id=c_user.id).first()
    user.follow.remove(forum)
    forum.followers -= 1
    db.session.commit()
    result  = forum_schema.dump(forum)
    return jsonify({'forum' : result})

@api.route('/api/remove_forum_picture/<int:id>', methods=['DELETE'])
@token_required
def remove_forum_image(c_user, id):
    forum = Forum.query.filter_by(id=id, owner_id=c_user.id).first()
    if forum is None or forum.display_picture == 'default.png':
        return jsonify({'message': 'Invalid request'}), 400
    file_path = os.path.join(app.root_path, f'static/forum_pics', forum.display_picture)
    os.remove(file_path)
    forum.display_picture = 'default.png'
    db.session.commit()
    return jsonify({'status':'Forum image has been removed'})

@api.route('/api/remove_user_picture', methods=['DELETE'])
@token_required
def remove_user_image(c_user):
    if c_user.display_picture == 'default.png':
        return jsonify({'message': 'Invalid request'}), 400
    file_path = os.path.join(app.root_path, f'static/user_pics', c_user.display_picture)
    os.remove(file_path)
    c_user.display_picture = 'default.png'
    db.session.commit()
    return jsonify({'status':'User image has been removed'})

# GET METHODS
@api.route('/api/posts', methods=['GET'])
def api_get_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 10, type=int)
    user_id = request.args.get('user_id', None, type=int)
    forum_id = request.args.get('forum_id', None, type=int)
    param = dict()
    if user_id:
        param['user_id'] = user_id
    if forum_id:
        param['forum_id'] = forum_id
    try:
        posts = Post.query.filter_by(**param).order_by(Post.date_posted.desc()).paginate(page=page, per_page=per_page)
    except:
        return jsonify({'message': 'Invalid request'}), 400
    result = list()
    for post in posts.items:
        user = user_schema.dump(post.author)
        forum = forum_schema.dump(post.forum)
        result.append({'id': post.id, 'title': post.title, 'date_posted': post.date_posted, 'content': post.content, 'num_of_comments': post.num_of_comments, 'user': user, 'forum': forum})
    paginate = list()
    for p in posts.iter_pages():
        paginate.append(p)
    return jsonify({'details':{ 'total': len(result), 'page': page, 'per_page': per_page, 'total_pages' : posts.pages, 'total_posts' : posts.total, 'paginate' : paginate }, 'posts': result})

@api.route('/api/post/<int:id>', methods=['GET'])
def api_get_post(id):
    post = Post.query.get(id)
    if post is None:
        return jsonify({'message': 'Post not found'}), 400
    user = user_schema.dump(post.author)
    forum = forum_schema.dump(post.forum)
    return jsonify({'post': {'id': post.id, 'title': post.title, 'date_posted': post.date_posted, 'content': post.content, 'num_of_comments': post.num_of_comments, 'user': user, 'forum': forum}})

@api.route('/api/comments', methods=['GET'])
def api_get_comments():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 10, type=int)
    user_id = request.args.get('user_id', None, type=int)
    post_id = request.args.get('post_id', None, type=int)
    param = dict()
    if user_id:
        param['user_id'] = user_id
    if post_id:
        param['post_id'] = post_id
    try:
        comments = Comment.query.filter_by(**param).order_by(Comment.date_commented.desc()).paginate(page=page, per_page=per_page)
    except:
        return jsonify({'message': 'Invalid request'}), 400
    result = list()
    for comment in comments.items:
        user = user_schema.dump(comment.comment_user)
        post = forum_schema.dump(comment.comment_post)
        result.append({'id': comment.id, 'content': comment.content, 'date_commented': comment.date_commented, 'num_of_reply':comment.num_of_reply, 'user': user, 'post':post})
    paginate = list()
    for p in comments.iter_pages():
        paginate.append(p)
    return jsonify({'details':{ 'total': len(result), 'page': page, 'per_page': per_page, 'total_pages' : comments.pages, 'total_posts' : comments.total, 'paginate' : paginate }, 'comments': result})

@api.route('/api/comment/<int:id>', methods=['GET'])
def api_get_comment(id):
    comment = Comment.query.get(id)
    if comment is None:
        return jsonify({'message': 'Comment not found'}), 400
    user = user_schema.dump(comment.comment_user)
    post = forum_schema.dump(comment.comment_post)
    return jsonify({'comment': {'id': comment.id, 'content': comment.content, 'date_commented': comment.date_commented, 'num_of_reply':comment.num_of_reply, 'user': user, 'post':post}})

@api.route('/api/replys', methods=['GET'])
def api_get_replys():
    comment_id = request.args.get('comment_id', None, type=int)
    user_id = request.args.get('user_id', None, type=int)
    param = dict()
    if comment_id:
        param['comment_id'] = comment_id
    if user_id:
        param['user_id'] = user_id
    try:
        replys = Reply.query.filter_by(**param).order_by(Reply.date_reply.desc())
    except:
        return jsonify({'message': 'Invalid request'}), 400
    result = list()
    for reply in replys:
        user = user_schema.dump(reply.reply_user)
        reply_json = {'id': reply.id, 'content': reply.content, 'date_reply': reply.date_reply, 'user': user}
        result.append(reply_json)
    return jsonify({'replys': result})

@api.route('/api/reply/<int:id>', methods=['GET'])
def api_get_reply(id):
    reply = Reply.query.get(id)
    if reply is None:
        return jsonify({'message': 'Reply not found'}), 400
    user = user_schema.dump(reply.reply_user)
    comment = forum_schema.dump(reply.reply)
    return jsonify({'reply': {'id': reply.id, 'content': reply.content, 'date_reply': reply.date_reply, 'user': user, 'comment':comment}})

@api.route('/api/forums', methods=['GET'])
def api_get_forums():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 15, type=int)
    user_id = request.args.get('owner_id', None, type=int)
    query = request.args.get('query', None, type=str)
    param = dict()
    if user_id:
        param['owner_id'] = user_id
    try:
        forums = Forum.query.filter_by(**param).order_by(Forum.date_created.desc()).filter(Forum.name.like(f"%{query}%")).paginate(page=page, per_page=per_page)
    except:
        return jsonify({'message': 'Invalid request'}), 400
    result = list()
    for forum in forums.items:
        user = user_schema.dump(forum.owner)
        result.append({'id': forum.id, 'name': forum.name, 'date_created': forum.date_created, 'about': forum.about, 'display_picture': forum.display_picture, 'followers': forum.followers, 'num_of_post': forum.num_of_post, 'user': user})
    paginate = list()
    for p in forums.iter_pages():
        paginate.append(p)
    return jsonify({'details':{ 'total': len(result), 'page': page, 'per_page': per_page, 'total_pages': forums.pages, 'paginate' : paginate }, 'forums': result})

@api.route('/api/forum', methods=['GET'])
def api_get_forum():
    id = request.args.get('id', None, type=int)
    name = request.args.get('name', None, type=str)
    owner_id = request.args.get('owner_id', None, type=int)
    param = dict()
    if id is None and name is None:
        return jsonify({'message': 'Invalid request'}), 400
    if id:
        param['id'] = id
    if name:
        param['name'] = name
    if owner_id:
        param['owner_id'] = owner_id
    forum = Forum.query.filter_by(**param).first()
    if forum is None:
        return jsonify({'message': 'Forum not found'}), 400
    user = user_schema.dump(forum.owner)
    return jsonify({'forum': {'id': forum.id, 'name': forum.name, 'date_created': forum.date_created, 'about': forum.about, 'display_picture': forum.display_picture, 'followers': forum.followers, 'num_of_post': forum.num_of_post, 'user': user}})

@api.route('/api/users', methods=['GET'])
def api_get_all_user():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 5, type=int)
    users = User.query.paginate(page=page, per_page=per_page).items
    result = users_schema.dump(users)
    return jsonify({'details':{ 'total': len(result), 'page': page, 'per_page': per_page }, 'users': result})

@api.route('/api/user_followers', methods=['GET'])
@token_required
def api_get_followers(c_user):
    follow = User.query.filter_by(id=c_user.id).first().follow.all()
    result = forums_schema.dump(follow)
    return jsonify({'num_of_followers' : len(result), 'user_followers': result})

@api.route('/api/user_follower', methods=['GET'])
@token_required
def api_user_following(c_user):
    forum_id = request.args.get('forum_id', None, type=int)
    if forum_id is None:
        return jsonify({'message': 'Invalid request'}), 400
    follow = User.query.filter_by(id=c_user.id).first().follow.filter_by(id=forum_id).first()
    if follow:
        result = forum_schema.dump(follow)
        return jsonify({'follow' : result})
    else:
        return jsonify({'message' : 'Invalid request'})

@api.route('/api/user', methods=['GET'])
def api_get_user():
    id = request.args.get('id', None, type=int)
    username = request.args.get('username', None, type=str)
    param = dict()
    if id is None and username is None:
        return jsonify({'message': 'Invalid request'}), 400
    if id:
        param['id'] = id
    if username:
        param['username'] = username
    user = User.query.filter_by(**param).first()
    if user is None:
        return jsonify({'message': 'User not found'}), 400
    result = user_schema.dump(user)
    return jsonify({'user': result})

@api.route('/api/autocomplete', methods=['GET'])
def autocomplete():
    query = request.args.get('query', None, type=str)
    limit = request.args.get('limit', 10, type=int)
    if query is None:
        return jsonify({'message': 'Invalid request'}), 400
    forums = Forum.query.filter_by().order_by(Forum.date_created.asc()).filter(Forum.name.like(f"{query}%")).limit(limit)
    result = forums_schema.dump(forums)
    return jsonify({'limit': limit, 'query': query, 'forums': result})
    

@api.route('/api/user/image/<string:file>', methods=['GET'])
def get_user_image(file):
    return send_file(current_app.root_path + '/static/user_pics/' + file)

@api.route('/api/forum/image/<string:file>', methods=['GET'])
def get_forum_image(file):
    return send_file(current_app.root_path + '/static/forum_pics/' + file)

# FUNCTIONS
def save_image(image, path_name):
    _,ext = os.path.splitext(image.filename)
    if ext != '.jpg' and ext != '.png':
        return None
    name = secrets.token_hex(16)
    file_name = name + ext
    file_path = os.path.join(app.root_path, f'static/{path_name}', file_name)
    size = (300, 300)
    i = Image.open(image)
    i.thumbnail(size)
    i.save(file_path)
    return file_name

