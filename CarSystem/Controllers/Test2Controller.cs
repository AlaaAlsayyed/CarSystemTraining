using CarSystem.Models.DB;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSystem.Controllers
{
    public class Test2Controller : Controller
    {
        private readonly CarSystemDBContext _db;
        public Test2Controller(CarSystemDBContext db)
        {
            _db = db;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        //[ActionName("AddCar")]
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

        //[HttpPut("PutCar")] you shoudn't use the attribute routing here, since it follows the conventinal routing mechanisem
        // you can put the http verb only without the route like [HttpPut] to allow only put resquest enter the action 
        [HttpPut]
        public string UpdateCar([FromBody] Car car)
        {
            try
            {
                _db.Cars.Update(car);
                _db.SaveChanges();

                return JsonConvert.SerializeObject(car);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(ex.Message);
            }
        }

        [HttpPatch]
        public string UpdateCar(string plateNumber, string newName)
        {
            try
            {
                var carToUpdate = _db.Cars.Where(c => c.PlateNumber == plateNumber).FirstOrDefault();
                carToUpdate.Name = newName;
                _db.SaveChanges();

                return JsonConvert.SerializeObject(carToUpdate);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(ex.Message);
            }
        }

        [HttpGet]
        //[ActionName("GetAllCars")]
        public string GetAllCars()
        {
            try
            {
                var cars = _db.Cars.ToList();

                return JsonConvert.SerializeObject(cars);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(ex.Message);
            }
        }

       [HttpGet]
        public string GetCar(string plateNumber)
        {
            try
            {
                var car = _db.Cars.Where(c => c.PlateNumber == plateNumber).FirstOrDefault();

                return JsonConvert.SerializeObject(car);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(ex.Message);
            }
        }

        [HttpDelete]
        public string DeleteCar(string plateNumber)
        {
            try
            {
                var car = _db.Cars.Where(c => c.PlateNumber == plateNumber).FirstOrDefault();
                _db.Cars.Remove(car);
                _db.SaveChanges();

                return JsonConvert.SerializeObject("delete is done successfuly");
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(ex.Message);
            }
        }
    }
}
