using EnglishLearning.Models.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EnglishLearning.Areas.Admin.Controllers
{
    public class LoginController : Controller
    {
        private EnglishEntities db = new EnglishEntities();
        // GET: Admin/Login
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult adminLogin(User model)
        {
            if (db.Users.Count(x => x.Account == model.Account && x.Password == model.Password && x.Type == 0) > 0)
            {
                var result = db.Users.SingleOrDefault(x => x.Account == model.Account && x.Password == model.Password && x.Type == 0);
                Session["admin"] = result;
                return Redirect("/admin/theme");

            }
            else
            {
                TempData["error"] = "Tài khoản hoặc mật khẩu không chính xác";
                return Redirect("/admin/theme");
            }
        }

        public ActionResult ChangePass()
        {
            return View();
        }

        [HttpPost]
        public ActionResult frmchangePass(long ID, string ex_password, string Password)
        {
            var admin = db.Users.Find(ID);
            if (admin.Password.Trim() == ex_password)
            {
                admin.Password = Password.Trim();
                db.SaveChanges();
                Session["admin"] = null;
                TempData["error"] = "Đổi mật khẩu thành công. Bạn vui lòng đăng nhập lại sau khi đổi mật khẩu.";
                return Redirect("/admin/login");
            }
            else
            {
                TempData["error"] = "Mật khẩu cũ không đúng, vui lòng nhập lại.";
                return Redirect("/admin/login/changePass");
            }

        }

        public ActionResult Logout()
        {
            Session["admin"] = null;
            return Redirect("/admin/login");
        }
    }
}