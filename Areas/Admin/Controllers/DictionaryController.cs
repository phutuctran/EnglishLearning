using EnglishLearning.Models.EF;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace EnglishLearning.Areas.Admin.Controllers
{
    public class DictionaryController : Controller
    {
        // GET: Admin/Dictionary
        private EnglishEntities db = new EnglishEntities();
        public ActionResult Index(int ID)
        {
            ViewBag.Themes = db.Themes.Find(ID);
            ViewBag.lstDictionary = db.Dictionaries.Where(x => x.Theme_ID == ID).OrderByDescending(x => x.ID).ToList();
            ViewBag.lstLevel = db.Dictionaries.Where(x => x.Theme_ID == ID).Select(x => x.Level).Distinct().ToList();
            return View();
        }


        [HttpPost]
        public ActionResult frmAdd(Dictionary entity, HttpPostedFileBase Image)
        {
            ViewBag.Level = entity.Level;
            var theme = db.Themes.Find(entity.Theme_ID);
            theme.TotalLevel = db.Dictionaries.Where(x => x.Theme_ID == entity.Theme_ID).Select(x => x.Level).Distinct().ToList().Count();
            db.SaveChanges();
            try
            {
                //Thêm hình ảnh
                var path = Path.Combine(Server.MapPath("~/Assets/Client/img/voca/"), Image.FileName);
                if (System.IO.File.Exists(path))
                {
                    string extensionName = Path.GetExtension(Image.FileName);
                    string filename = Image.FileName + DateTime.Now.ToString("ddMMyyyy") + extensionName;
                    path = Path.Combine(Server.MapPath("~/Assets/Client/img/voca/"), filename);
                    Image.SaveAs(path);
                    entity.Image = filename;
                }
                else
                {
                    Image.SaveAs(path);
                    entity.Image = Image.FileName;
                }
                entity.DateCreated = DateTime.Now;
                db.Dictionaries.Add(entity);
                db.SaveChanges();
                TempData["message"] = "Thêm từ vựng thành công";
                TempData["alert"] = "alert-success";
                return Redirect("/admin/dictionary/index/" + entity.Theme_ID);

            }
            catch
            {
                TempData["message"] = "Thêm từ vựng KHÔNG thành công";
                TempData["alert"] = "alert-danger";
                return Redirect("/admin/dictionary/index/" + entity.Theme_ID);
            }
        }

        [HttpPost]
        public ActionResult frmEdit(Dictionary entity, HttpPostedFileBase Image)
        {
            try
            {
                var voca = db.Dictionaries.Find(entity.ID);
                voca.Text = entity.Text;
                voca.Mean = entity.Mean;
                //voca.Type = entity.Type;
                voca.Level = entity.Level;

               
                if (Image != null && voca.Image != Image.FileName)
                {
                    
                    //Xóa file cũ
                    if (voca.Image != null)
                        System.IO.File.Delete(Path.Combine(Server.MapPath("~/Assets/Client/img/voca"), voca.Image));
                    //Thêm hình ảnh
                    var path = Path.Combine(Server.MapPath("~/Assets/Client/img/voca"), Image.FileName);
                    if (System.IO.File.Exists(path))
                    {
                        string extensionName = Path.GetExtension(Image.FileName);
                        string filename = Image.FileName + DateTime.Now.ToString("ddMMyyyy") + extensionName;
                        path = Path.Combine(Server.MapPath("~/Assets/Client/img/voca/"), filename);
                        Image.SaveAs(path);
                        voca.Image = filename;
                    }
                    else
                    {
                        Image.SaveAs(path);
                        voca.Image = Image.FileName;
                    }
                }

                db.SaveChanges();
                TempData["message"] = "Cập nhật từ vựng thành công";
                TempData["alert"] = "alert-success";
                return Redirect("/admin/dictionary/index/" + entity.Theme_ID);
            }
            catch
            {
                TempData["message"] = "Cập nhật từ vựng KHÔNG thành công";
                TempData["alert"] = "alert-danger";
                return Redirect("/admin/dictionary/index/" + entity.Theme_ID);
            }
        }


       
        public JsonResult Delete(int ID)
        {
            var model = db.Dictionaries.Find(ID);
            //Xóa file cũ
            if (model.Image != null)
                System.IO.File.Delete(Path.Combine(Server.MapPath("~/Assets/Client/img/voca"), model.Image));
            db.Dictionaries.Remove(model);
            db.SaveChanges();
            return Json(new
            {
                status = true
            });
        }

        public JsonResult GetByID(long ID)
        {
            db.Configuration.ProxyCreationEnabled = false;
            var model = db.Dictionaries.Find(ID);
            return Json(model, JsonRequestBehavior.AllowGet);
        }

    }
}