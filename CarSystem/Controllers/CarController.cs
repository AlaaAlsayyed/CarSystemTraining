using CarSystem.Models.DB;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarController : ControllerBase
    {
        private readonly CarSystemDBContext _db;
        public CarController(CarSystemDBContext db)
        {
            _db = db;
        }

        [HttpPost("AddCar")]
        public string AddCar(Car car)
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

        [HttpPut("PutCar")]
        public string UpdateCar(Car car)
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

        [HttpPatch("PatchCar")]
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

        [HttpGet("GetAllCars")]
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

        [HttpGet("GetCar")]
        public string GetCar(string plateNumber)
        {
            try
            {
                var car=_db.Cars.Where(c=>c.PlateNumber == plateNumber).FirstOrDefault();

                return JsonConvert.SerializeObject(car);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(ex.Message);
            }
        }

        [HttpDelete("DeleteCar")]
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

