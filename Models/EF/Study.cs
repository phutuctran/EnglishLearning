//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace EnglishLearning.Models.EF
{
    using System;
    using System.Collections.Generic;
    
    public partial class Study
    {
        public int ID { get; set; }
        public Nullable<int> User_ID { get; set; }
        public Nullable<int> Theme_ID { get; set; }
        public Nullable<int> CurrentLevel { get; set; }
        public Nullable<System.DateTime> DateStudy { get; set; }
    
        public virtual Theme Theme { get; set; }
        public virtual User User { get; set; }
    }
}
