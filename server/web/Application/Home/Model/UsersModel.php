<?php
namespace Home\Model;
use Think\Model;
class UsersModel extends Model {		
    protected $fields = array('uid', 'username', 'password', 'openid', 'desc');
    protected $pk = 'uid';
}
