using EnglishLearning.Models.EF;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EnglishLearning.Areas.Admin.Controllers
{
    public class ThemeController : Controller
    {
        private EnglishEntities db = new EnglishEntities();
        public ActionResult Index()
        {
            ViewBag.Themes = db.Themes.OrderByDescending(x => x.ID).ToList();
            return View();
        }


        public JsonResult Delete(long ID)
        {

            try
            {
                var model = db.Themes.Find(ID);
                //Xóa file cũ
                if (model.Image != null)
                    System.IO.File.Delete(Path.Combine(Server.MapPath("~/Assets/Client/img/themes"), model.Image));
                db.Themes.Remove(model);
                db.SaveChanges();
                return Json(new
                {
                    status = true
                });
            }
            catch
            {
                return Json(new
                {
                    status = false
                });
            }

        }


        [HttpPost]
        public ActionResult add(Theme entity, HttpPostedFileBase Image)
        {
            //try
            //{
                //Thêm hình ảnh
                var path = Path.Combine(Server.MapPath("~/Assets/Client/img/themes"), Image.FileName);
                if (System.IO.File.Exists(path))
                {
                    string extensionName = Path.GetExtension(Image.FileName);
                    string filename = Image.FileName + DateTime.Now.ToString("ddMMyyyy") + extensionName;
                    path = Path.Combine(Server.MapPath("~/Assets/Client/img/themes"), filename);
                    Image.SaveAs(path);
                    entity.Image = filename;
                }
                else
                {
                    Image.SaveAs(path);
                    entity.Image = Image.FileName;
                }
                entity.TotalLevel = 0;
                db.Themes.Add(entity);
                db.SaveChanges();
                TempData["message"] = "Thêm chủ đề thành công";
                TempData["alert"] = "alert-success";
                return Redirect("/admin/theme");

            //}
            //catch
            //{
            //    TempData["message"] = "Thêm chủ đề KHÔNG thành công";
            //    TempData["alert"] = "alert-danger";
            //    return Redirect("/admin/theme");
            //}
        }

        [HttpPost]
        public ActionResult edit(Theme entity, HttpPostedFileBase Image)
        {
            try
            {
                var prv = db.Themes.Find(entity.ID);
                prv.Name = entity.Name.Trim();
                prv.Mean = entity.Mean.Trim();

                if (Image != null && prv.Image != Image.FileName)
                {
                    //Xóa file cũ
                    if (prv.Image != null)
                        System.IO.File.Delete(Path.Combine(Server.MapPath("~/Assets/Client/img/themes"), prv.Image));
                    //Thêm hình ảnh
                    var path = Path.Combine(Server.MapPath("~/Assets/Client/img/themes"), Image.FileName);
                    if (System.IO.File.Exists(path))
                    {
                        string extensionName = Path.GetExtension(Image.FileName);
                        string filename = Image.FileName + DateTime.Now.ToString("ddMMyyyy") + extensionName;
                        path = Path.Combine(Server.MapPath("~/Assets/Client/img/themes/"), filename);
                        Image.SaveAs(path);
                        prv.Image = filename;
                    }
                    else
                    {
                        Image.SaveAs(path);
                        prv.Image = Image.FileName;
                    }
                }

                db.SaveChanges();
                TempData["message"] = "Cập nhật chủ đề thành công";
                TempData["alert"] = "alert-success";
                return Redirect("/admin/theme");
            }
            catch
            {
                TempData["message"] = "Cập nhật chủ đề KHÔNG thành công";
                TempData["alert"] = "alert-danger";
                return Redirect("/admin/theme");
            }
        }

        public JsonResult GetByID(long ID)
        {
            db.Configuration.ProxyCreationEnabled = false;
            var theme = db.Themes.Find(ID);
            return Json(theme, JsonRequestBehavior.AllowGet);
        }
    }
}