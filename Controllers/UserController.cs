using EnglishLearning.Models.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EnglishLearning.Controllers
{
    public class UserController : Controller
    {
        private EnglishEntities db = new EnglishEntities();
        // GET: User
        public ActionResult Test()
        {
            var user = Session["user"] as User;
            if (user == null)
            {
                TempData["error"] = "Bạn vui lòng đăng nhập để vào học";
                return Redirect("/login");
            }
            ViewBag.lstTest = db.Tests.Where(x => x.User_ID == user.ID).OrderByDescending(x => x.DateTest).ToList();
            return View();
        }

        public ActionResult Info()
        {
            var user = Session["user"] as User;
            if (user == null)
            {
                TempData["error"] = "Bạn vui lòng đăng nhập để vào học";
                return Redirect("/login");
            }
            ViewBag.User = db.Users.Find(user.ID);
            return View();
        }

        [HttpPost]
        public ActionResult frmUpdate(User entity)
        {
            var user = Session["user"] as User;
            var res = db.Users.Find(user.ID);
            res.Fullname = entity.Fullname;
            res.Birthday = entity.Birthday;
            res.Sex = entity.Sex;
            res.Phone = entity.Phone;
            res.Email = entity.Email;
            db.SaveChanges();
            Session["user"] = res;
            TempData["message"] = "Cập nhật thông tin thành công.";
            return Redirect("/user/info");
        }
    }
}