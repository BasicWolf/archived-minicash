class MinicashError(Exception):
    pass


class UserNotLoggedInError(MinicashError):
    def __init__(self):
        super().__init__('User not logged in')
