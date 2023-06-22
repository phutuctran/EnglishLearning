using EnglishLearning.Models.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EnglishLearning.Controllers
{
    public class LoginController : Controller
    {
        private EnglishEntities db = new EnglishEntities();
        // GET: Login
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult frmLogin(User entity)
        {
            var res = db.Users.Count(x => x.Account == entity.Account && x.Password == entity.Password);
            if (res > 0)
            {
                var user = db.Users.FirstOrDefault(x => x.Account == entity.Account && x.Password == entity.Password);
                if (user.Status == false)
                {
                    TempData["message"] = "Tài khoản của bạn đã bị khóa.";
                    return Redirect("/login");
                }
                else
                {
                    Session["user"] = user;
                    return Redirect("/");
                }
            }
            else
            {
                TempData["message"] = "Tài khoản hoặc mật khẩu không đúng, vui lòng kiểm tra lại.";
                return Redirect("/login");
            }
        }

        public ActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public ActionResult frmRegister(User entity)
        {
            var res = db.Users.Count(x => x.Account == entity.Account);
            if (res > 0)
            {
                TempData["message"] = "Tài khoản đăng ký đã tồn tại, vui lòng nhập lại.";
                return Redirect("/register");
            }
            entity.Type = 1;
            entity.Status = true;
            db.Users.Add(entity);
            db.SaveChanges();

            TempData["message"] = "Đăng ký tài khoản thành công. Bạn vui lòng đăng nhập để tiếp tục";
            return Redirect("/login");
        }

        public ActionResult Logout()
        {
            Session["user"] = null;
            return Redirect("/");
        }
    }
}