using EnglishLearning.Models.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EnglishLearning.Areas.Admin.Controllers
{
    public class UserController : Controller
    {
        private EnglishEntities db = new EnglishEntities();
        public ActionResult Index()
        {
            ViewBag.User = db.Users.Where(x => x.Type == 1).OrderByDescending(x => x.Fullname).ToList();
            return View();
        }

        public JsonResult changeStatus(long ID)
        {
            var user = db.Users.Find(ID);
            if (user.Status == true)
                user.Status = false;
            else
                user.Status = true;
            db.SaveChanges();
            return Json(new
            {
                status = true
            });
        }
    }
}