
import re

# User validation
class input_validator:
    @classmethod
    def validEmail(self, email, errors):
        pattern = r'^([\w\.-]+)@([a-zA-Z-]+).([a-zA-Z]{2,10})(\.[a-zA-Z]{2,10})$'
        if len(email) > 254 or not re.search(pattern, email):
            errors.update({'email_errors' : 'Invalid email address. Email must not exceed 254 characters'})
            
    @classmethod
    def validPassword(self, password, errors):
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])(?=.*[!"#$%&\'\\()*+,-./:;<=>?@[\\\]^_`{|}~])[a-zA-Z\d!"#$%&\'\\()*+,-./:;<=>?@[\\\]^_`{|}~]{8,128}$'
        if not re.search(pattern, password):
            errors.update({'password_errors' : 'Password must be 8 or more characters long and contain atleast one uppercase, lowercase, digit and special character. Password must not exceed 128 characters'})

    @classmethod
    def validUsername(self, username, errors):
        pattern = r'^\w{3,25}$'
        if not re.search(pattern, username):
            errors.update({'username_errors' : 'Username must be between 3 and 25 characters long and must not have any white spaces'})

    @classmethod
    #Forum validation
    def validForumName(self, name, errors):
        pattern = r'^\w{3,25}$'
        if not re.search(pattern, name):
            errors.update({'forum_name_errors' : 'Forum name must be between 3 and 25 characters long and must not have any white spaces'})

    @classmethod
    def validForumAbout(self, about, errors):
        pattern = r'^.{0,30000}$'
        if not re.search(pattern, about):
            errors.update({'forum_name_errors' : 'Forum about must not exceed 30000 characters'})

    @classmethod
    #Post validation
    def validPostTitle(self, title, errors):
        pattern = r'^.{1,5000}$'
        if not re.search(pattern, title):
            errors.update({'post_title_errors' : 'Post title must be atleast 1 character long and must not exceed 5000 characters'})

    @classmethod
    def validPostContent(self, content, errors):
        pattern = r'^.{0,30000}$'
        if not re.search(pattern, content):
            errors.update({'post_content_errors' : 'Post content must not exceed 30000 characters long'})

    @classmethod
    #Comment validation
    def validCommentContent(self,content, errors):
        pattern = r'^.{1,20000}$'
        if not re.search(pattern, content):
            errors.update({'comment_content_errors' : 'Comment content must be atleast 1 character long and must not exceed 20000 characters'})

    @classmethod
    #Reply validation
    def validReplyContent(self,content, errors):
        pattern = r'^.{1,20000}$'
        if not re.search(pattern, content):
            errors.update({'reply_content_errors' : 'Reply content must be atleast 1 character long and must not exceed 20000 characters'})

    @classmethod
    #Invalid Request Message
    def InvalidRequest():
        return {'message' : 'Invalid request'}