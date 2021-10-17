using CarSystem.Models;
using CarSystem.Models.DB;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace CarSystem.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly CarSystemDBContext _db;

        public HomeController(ILogger<HomeController> logger, CarSystemDBContext db)
        {
            _logger = logger;
            _db = db;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Index2()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [HttpPost]
        [ActionName("AddCar")]
        public string AddCar([FromBody] Car car)
        {
            try
            {
                _db.Cars.Add(car);
                _db.SaveChanges();

                return JsonConvert.SerializeObject(car);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(ex.Message);
            }
        }

        [HttpGet]
        [ActionName("GetCars")]
        public string GetAllCars()
        {
            try
            {
                var cars = _db.Cars.ToList();

                return JsonConvert.SerializeObject(cars);
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        [HttpPatch]
        [ActionName("PatchCars")]
        public APIResponse PatchCars([FromBody] DataTableEditorAjaxPutModel dataTableEditorAjaxModel)
        {
            List<FieldError> lstFieldErrors = new List<FieldError>();

            try
            {
                if (dataTableEditorAjaxModel == null)
                    return new APIResponse(false, "dataTableEditorAjaxPutModel is null");

                if (string.IsNullOrWhiteSpace(dataTableEditorAjaxModel.action))
                    return new APIResponse(false, "action is null");

                if (dataTableEditorAjaxModel.data == null)
                    return new APIResponse(false, "data is null");

                var IDs = dataTableEditorAjaxModel.data.Keys;
                foreach (var obj in dataTableEditorAjaxModel.data)
                {
                    var carInfo = _db.Cars.Find(Convert.ToInt32(obj.Key));
                    if (carInfo == null)
                        return new APIResponse(false, $"data was modified. (Id = {obj.Key})");

                    if (dataTableEditorAjaxModel.action == "edit")
                    {
                        if (obj.Value.ContainsKey("Name"))
                        {
                            if (string.IsNullOrWhiteSpace(obj.Value["Name"]))
                                lstFieldErrors.Add(new FieldError() { name = "CarName", status = "The car type cannot be empty" });
                            else
                                carInfo.Name = obj.Value["Name"];
                        }
                        if (obj.Value.ContainsKey("PlateNumber"))
                        {
                            if (string.IsNullOrWhiteSpace(obj.Value["PlateNumber"]))
                                lstFieldErrors.Add(new FieldError() { name = "PlateNumber", status = "The car number cannot be empty" });
                            else
                                carInfo.PlateNumber = obj.Value["PlateNumber"];
                        }
                        if (obj.Value.ContainsKey("LicanceId"))
                        {
                            carInfo.LicanceId = obj.Value["LicanceId"];
                        }
                    }
                    else if (dataTableEditorAjaxModel.action == "remove")
                    {
                        _db.Remove(carInfo);
                    }
                }// end foreach

                // check for errors
                if (lstFieldErrors.Count > 0)
                    return new APIResponse(false, "Validation error(s)", new { fieldErrors = lstFieldErrors, data = new string[] { } });

                int affectedRecords = _db.SaveChanges();

                return new APIResponse(true, $"affectedRecords = {affectedRecords}", dataTableEditorAjaxModel);
            }// end try
            catch (Exception ex)
            {
                return new APIResponse(false, ex.Message, dataTableEditorAjaxModel);
            }// end catch
        }// end Patch
    }
}
