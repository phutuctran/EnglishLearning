using EnglishLearning.Models.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EnglishLearning.Controllers
{
    public class HomeController : Controller
    {
        private EnglishEntities db = new EnglishEntities();
        public ActionResult Index()
        {
            ViewBag.Theme = db.Themes.OrderByDescending(x => x.ID).ToList();
            return View();
        }

    }
}