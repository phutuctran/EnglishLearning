using EnglishLearning.Models.DTO;
using EnglishLearning.Models.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace EnglishLearning.Controllers
{
    public class FlashcardController : Controller
    {
        private EnglishEntities db = new EnglishEntities();
        // GET: Flashcard
        public ActionResult Index(int ID)
        {
            var user = Session["user"] as User;
            if(user == null)
            {
                TempData["error"] = "Bạn vui lòng đăng nhập để vào học";
                return Redirect("/login");
            }    

            ViewBag.Theme = db.Themes.Find(ID);
           
            ViewBag.lstDictionary = db.Dictionaries.Where(x => x.Theme_ID == ID).OrderByDescending(x => x.ID).ToList();
            ViewBag.lstLevel = db.Dictionaries.Where(x => x.Theme_ID == ID).Select(x => x.Level).Distinct().ToList();

            ViewBag.lstStudy = db.Studies.Where(x => x.Theme_ID == ID && x.User_ID == user.ID).ToList();
            return View();
        }

        public ActionResult Detail(int ID, int Level)
        {
            var user = Session["user"] as User;
            if (user == null)
            {
                TempData["error"] = "Bạn vui lòng đăng nhập để vào học";
                return Redirect("/login");
            }

            if(db.Studies.Count(x => x.Theme_ID == ID && x.User_ID == user.ID && x.CurrentLevel == Level) > 0)
            {
                var study = db.Studies.FirstOrDefault(x => x.Theme_ID == ID && x.User_ID == user.ID && x.CurrentLevel == Level);
                study.DateStudy = DateTime.Now;
                db.SaveChanges();
            }
            else
            {
                var study = new Study();
                study.Theme_ID = ID;
                study.CurrentLevel = Level;
                study.User_ID = user.ID;
                study.DateStudy = DateTime.Now;
                db.Studies.Add(study);
                db.SaveChanges();
            }

            ViewBag.Level = Level;
            ViewBag.lstTheme = db.Themes.Where(x => x.ID != ID).ToList();
            ViewBag.Theme = db.Themes.Find(ID);
            ViewBag.lstDictionary = db.Dictionaries.Where(x => x.Theme_ID == ID && x.Level == Level).ToList();

            return View();
        }

        public ActionResult Test(int ID, int Level)
        {
            var user = Session["user"] as User;
            if (user == null)
            {
                TempData["error"] = "Bạn vui lòng đăng nhập để vào học";
                return Redirect("/login");
            }

            ViewBag.Level = Level;
            ViewBag.Theme = db.Themes.Find(ID);
            ViewBag.lstText = db.Dictionaries.Where(x => x.Theme_ID == ID && x.Level == Level).ToList();

            var lst_voca = new List<Dictionary>();
            var random = new Random();
            long index = random.Next(1, 4);
            if (index == 1)
                lst_voca = db.Dictionaries.Where(x => x.Theme_ID == ID && x.Level == Level).OrderByDescending(x => x.Mean).ToList();
            else if (index == 2)
                lst_voca = db.Dictionaries.Where(x => x.Theme_ID == ID && x.Level == Level).OrderBy(x => x.Mean).ToList();
            else if (index == 3)
                lst_voca = db.Dictionaries.Where(x => x.Theme_ID == ID && x.Level == Level).OrderByDescending(x => x.Image).ToList();
            else
                lst_voca = db.Dictionaries.Where(x => x.Theme_ID == ID && x.Level == Level).OrderBy(x => x.Image).ToList();

            ViewBag.lstMean = lst_voca;

            var lstLevel = db.Dictionaries.Where(x => x.Theme_ID == ID).Select(x => x.Level).Distinct().ToList();
            int? nextLevel = new int();
            for (int i = 0; i < lstLevel.Count; i++)
            {
                if (lstLevel[i] == Level && i + 1 < lstLevel.Count)
                {
                    nextLevel = lstLevel[i + 1];
                    break;
                }else if(i + 1 == lstLevel.Count)
                {
                    nextLevel = 0;
                }
            }
            ViewBag.NextLevel = nextLevel;
            return View();
        }

        public JsonResult addTest(string strjson)
        {
            var JsonScript = new JavaScriptSerializer().Deserialize<List<Test>>(strjson);
            var test = new Test();
            var study = new Study();
            foreach (var item in JsonScript)
            {
                test.Theme_ID = item.Theme_ID;
                test.Level = item.Level;
                test.DateTest = DateTime.Now;
                test.User_ID = item.User_ID;
                test.Point = item.Point;
                test.Result = item.Result;
                test.Status = item.Status;

                if(item.Status == true && item.ID != 0)
                {
                    study.Theme_ID = item.Theme_ID;
                    study.CurrentLevel = item.ID;
                    study.User_ID = item.User_ID;
                    study.DateStudy = DateTime.Now;
                    db.Studies.Add(study);
                }
            }
            db.Tests.Add(test);
            db.SaveChanges();
            return Json(new
            {
                status = true
            });
        }

        public JsonResult Check_Anwser(int ID, string Text)
        {
			Text = Text.Replace("_", " ");
			db.Configuration.ProxyCreationEnabled = false;
            var voca = db.Dictionaries.Count(x => x.ID == ID && x.Text == Text);
            if(voca > 0)
            {
                return Json(new
                {
                    status = true
                }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                var anwser = db.Dictionaries.Find(ID);
                return Json(new
                {
                    status = false,
                    anwser = anwser,
                    text = Text
                }, JsonRequestBehavior.AllowGet);
            }
            
        }

        public ActionResult Game(int ID)
        {
            var user = Session["user"] as User;
            if (user == null)
            {
                TempData["error"] = "Bạn vui lòng đăng nhập để vào thi";
                return Redirect("/login");
            }
            var lst_voca = new List<Dictionary>();
            var random = new Random();
            long index = random.Next(1, 4);
            if (index == 1)
                lst_voca = db.Dictionaries.Where(x => x.Theme_ID == ID).OrderByDescending(x => x.Mean).ToList();
            else if (index == 2)
                lst_voca = db.Dictionaries.Where(x => x.Theme_ID == ID).OrderBy(x => x.Mean).ToList();
            else if (index == 3)
                lst_voca = db.Dictionaries.Where(x => x.Theme_ID == ID).OrderByDescending(x => x.Image).ToList();
            else
                lst_voca = db.Dictionaries.Where(x => x.Theme_ID == ID).OrderBy(x => x.Image).ToList();

            var lstGame = new List<GameDTO>();
            foreach(var item in lst_voca.Take(10))
            {
                var game = new GameDTO();
                game.Vocabulary = item;
                var voca = lst_voca.Where(x => x.ID != item.ID).ToList();
                var number = new List<int>();
                int dem = 1;
                var rad = new Random();
                while (true)
                {
                    int i = rad.Next(0, voca.Count - 1);
                    if (!number.Contains(i))
                    {
                        number.Add(i);
                        dem++;
                    }
                    if (dem == 4) break;
                }
                game.Anwser = new List<string>();
                game.Anwser.Add(item.Text);
                game.Anwser.Add(voca[number[0]].Text);
                game.Anwser.Add(voca[number[1]].Text);
                game.Anwser.Add(voca[number[2]].Text);

                Shuffle(game.Anwser);
                lstGame.Add(game);
            }
            ViewBag.Theme = db.Themes.Find(ID);
            ViewBag.lstGame = lstGame;
            return View();
        }
        private Random rng = new Random();

        public void Shuffle(List<string> list)
        {
            int n = list.Count;
            while (n > 1)
            {
                n--;
                int k = rng.Next(n + 1);
                string value = list[k];
                list[k] = list[n];
                list[n] = value;
            }
        }

    }
}