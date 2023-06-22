using EnglishLearning.Models.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EnglishLearning.Models.DTO
{
    public class GameDTO
    {
        public Dictionary Vocabulary { get; set; }
        public List<string> Anwser { get; set; }
    }
}